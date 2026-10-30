from __future__ import annotations

from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

import numpy as np
import pandas as pd

LONDON = ZoneInfo("Europe/London")
UTC = ZoneInfo("UTC")


def decision_cutoff(delivery_date: date) -> datetime:
    """Noon London time on the calendar day before delivery."""
    return datetime.combine(delivery_date - timedelta(days=1), time(12), LONDON)


def delivery_bounds(delivery_date: date) -> tuple[datetime, datetime]:
    start = datetime.combine(delivery_date, time.min, LONDON)
    return start.astimezone(UTC), (start + timedelta(days=1)).astimezone(UTC)


def _records_frame(records: list[dict], timestamp_columns: tuple[str, ...]) -> pd.DataFrame:
    frame = pd.DataFrame(records)
    for column in timestamp_columns:
        if column in frame:
            frame[column] = pd.to_datetime(frame[column], utc=True, errors="coerce")
    return frame


def prepare_actuals(records: list[dict], delivery_date: date) -> pd.DataFrame:
    """Filter WIND records and keep the latest duplicate for each interval."""
    frame = _records_frame(records, ("startTime", "publishTime"))
    if frame.empty or not {"startTime", "fuelType", "generation"}.issubset(frame.columns):
        return pd.DataFrame(columns=["start_time", "actual_mw"])

    start, end = delivery_bounds(delivery_date)
    frame = frame[
        frame["fuelType"].astype(str).str.upper().eq("WIND")
        & frame["startTime"].between(start, end, inclusive="left")
    ].copy()
    if frame.empty:
        return pd.DataFrame(columns=["start_time", "actual_mw"])

    frame["generation"] = pd.to_numeric(frame["generation"], errors="coerce")
    sort_columns = ["startTime"] + (["publishTime"] if "publishTime" in frame else [])
    frame = frame.sort_values(sort_columns).drop_duplicates("startTime", keep="last")
    return frame[["startTime", "generation"]].rename(
        columns={"startTime": "start_time", "generation": "actual_mw"}
    )


def select_forecasts(
    records: list[dict], delivery_date: date, cutoff: datetime
) -> pd.DataFrame:
    """Select the latest eligible vintage and interpolate it onto half-hour intervals."""
    frame = _records_frame(records, ("startTime", "publishTime"))
    required = {"startTime", "publishTime", "generation"}
    if frame.empty or not required.issubset(frame.columns):
        return pd.DataFrame(
            columns=["start_time", "forecast_mw", "forecast_publish_time", "is_interpolated"]
        )

    start, end = delivery_bounds(delivery_date)
    cutoff_utc = pd.Timestamp(cutoff).tz_convert("UTC")
    frame = frame[
        (frame["publishTime"] <= cutoff_utc)
        & frame["startTime"].between(start, end, inclusive="both")
    ].copy()
    if frame.empty:
        return pd.DataFrame(
            columns=["start_time", "forecast_mw", "forecast_publish_time", "is_interpolated"]
        )

    frame["generation"] = pd.to_numeric(frame["generation"], errors="coerce")
    frame = (
        frame.sort_values(["startTime", "publishTime"])
        .drop_duplicates("startTime", keep="last")
        .set_index("startTime")
        .sort_index()
    )

    target_index = pd.date_range(start=start, end=end, freq="30min", inclusive="left")
    combined_index = frame.index.union(target_index).sort_values()
    generation = frame["generation"].reindex(combined_index).interpolate(method="time")

    # Forecast publications usually match across a vintage. At an interpolated point,
    # use the most recent of the adjacent eligible source publications.
    published = frame["publishTime"].reindex(combined_index)
    published = pd.concat(
        [published.ffill().rename("previous"), published.bfill().rename("next")], axis=1
    ).max(axis=1)

    result = pd.DataFrame(
        {
            "start_time": target_index,
            "forecast_mw": generation.reindex(target_index).values,
            "forecast_publish_time": published.reindex(target_index).array,
            "is_interpolated": ~target_index.isin(frame.index),
        }
    )
    return result.dropna(subset=["forecast_mw"])


def match_intervals(actuals: pd.DataFrame, forecasts: pd.DataFrame) -> pd.DataFrame:
    if actuals.empty:
        return pd.DataFrame(
            columns=[
                "start_time",
                "actual_mw",
                "forecast_mw",
                "forecast_publish_time",
                "is_interpolated",
                "error_mw",
            ]
        )
    matched = actuals.merge(forecasts, on="start_time", how="left", validate="one_to_one")
    matched["error_mw"] = matched["forecast_mw"] - matched["actual_mw"]
    return matched.sort_values("start_time").reset_index(drop=True)


def calculate_metrics(matched: pd.DataFrame) -> dict[str, float | int | None]:
    valid = matched.dropna(subset=["forecast_mw", "actual_mw"]) if not matched.empty else matched
    missing = int(len(matched) - len(valid))
    if valid.empty:
        return {
            "average_forecast_mw": None,
            "average_actual_mw": None,
            "mae_mw": None,
            "rmse_mw": None,
            "bias_mw": None,
            "matched_intervals": 0,
            "missing_intervals": missing,
        }
    errors = valid["forecast_mw"] - valid["actual_mw"]
    return {
        "average_forecast_mw": float(valid["forecast_mw"].mean()),
        "average_actual_mw": float(valid["actual_mw"].mean()),
        "mae_mw": float(errors.abs().mean()),
        "rmse_mw": float(np.sqrt(np.mean(np.square(errors)))),
        "bias_mw": float(errors.mean()),
        "matched_intervals": int(len(valid)),
        "missing_intervals": missing,
    }
