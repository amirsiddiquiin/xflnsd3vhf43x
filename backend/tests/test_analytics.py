from datetime import date, datetime, timezone

import pandas as pd
import pytest

from app.analytics import (
    calculate_metrics,
    match_intervals,
    prepare_actuals,
    select_forecasts,
)

DAY = date(2026, 1, 10)
CUTOFF = datetime(2026, 1, 9, 12, tzinfo=timezone.utc)


def test_actuals_filter_wind_and_keep_latest_duplicate():
    records = [
        {"startTime": "2026-01-10T00:00:00Z", "publishTime": "2026-01-10T00:30:00Z", "fuelType": "WIND", "generation": 100},
        {"startTime": "2026-01-10T00:00:00Z", "publishTime": "2026-01-10T01:00:00Z", "fuelType": "WIND", "generation": 110},
        {"startTime": "2026-01-10T00:00:00Z", "publishTime": "2026-01-10T01:00:00Z", "fuelType": "CCGT", "generation": 999},
    ]
    result = prepare_actuals(records, DAY)
    assert result["actual_mw"].tolist() == [110]


def test_forecasts_use_latest_publication_before_cutoff():
    records = [
        {"startTime": "2026-01-10T00:00:00Z", "publishTime": "2026-01-09T10:00:00Z", "generation": 100},
        {"startTime": "2026-01-10T00:00:00Z", "publishTime": "2026-01-09T11:30:00Z", "generation": 120},
        {"startTime": "2026-01-10T00:00:00Z", "publishTime": "2026-01-09T12:30:00Z", "generation": 999},
        {"startTime": "2026-01-10T01:00:00Z", "publishTime": "2026-01-09T11:30:00Z", "generation": 140},
    ]
    result = select_forecasts(records, DAY, CUTOFF)
    first = result.iloc[0]
    half_hour = result.iloc[1]
    assert first["forecast_mw"] == 120
    assert half_hour["forecast_mw"] == 130
    assert bool(half_hour["is_interpolated"])


def test_hourly_forecast_is_transparently_aligned_to_48_half_hours():
    records = [
        {
            "startTime": timestamp.isoformat().replace("+00:00", "Z"),
            "publishTime": "2026-01-09T11:30:00Z",
            "generation": 100 + hour * 10,
        }
        for hour, timestamp in enumerate(
            pd.date_range("2026-01-10T00:00:00Z", "2026-01-11T00:00:00Z", freq="1h")
        )
    ]

    result = select_forecasts(records, DAY, CUTOFF)

    assert len(result) == 48
    assert int(result["is_interpolated"].sum()) == 24
    assert result.iloc[0]["forecast_mw"] == 100
    assert result.iloc[1]["forecast_mw"] == 105


def test_interpolation_does_not_extrapolate_missing_final_endpoint():
    records = [
        {
            "startTime": timestamp.isoformat().replace("+00:00", "Z"),
            "publishTime": "2026-01-09T11:30:00Z",
            "generation": 100 + hour * 10,
        }
        for hour, timestamp in enumerate(
            pd.date_range("2026-01-10T00:00:00Z", "2026-01-10T23:00:00Z", freq="1h")
        )
    ]

    result = select_forecasts(records, DAY, CUTOFF)

    assert len(result) == 47
    assert result.iloc[-1]["start_time"] == pd.Timestamp("2026-01-10T23:00:00Z")


def test_interpolation_does_not_bridge_a_missing_source_hour():
    records = [
        {"startTime": "2026-01-10T00:00:00Z", "publishTime": "2026-01-09T11:30:00Z", "generation": 100},
        {"startTime": "2026-01-10T02:00:00Z", "publishTime": "2026-01-09T11:30:00Z", "generation": 140},
    ]

    result = select_forecasts(records, DAY, CUTOFF)

    assert result["start_time"].tolist() == [
        pd.Timestamp("2026-01-10T00:00:00Z"),
        pd.Timestamp("2026-01-10T02:00:00Z"),
    ]


def test_matching_uses_start_time_and_preserves_missing_forecasts():
    actuals = pd.DataFrame(
        {"start_time": pd.to_datetime(["2026-01-10T00:00:00Z", "2026-01-10T00:30:00Z"]), "actual_mw": [90, 100]}
    )
    forecasts = pd.DataFrame(
        {"start_time": pd.to_datetime(["2026-01-10T00:00:00Z"]), "forecast_mw": [95], "forecast_publish_time": pd.to_datetime(["2026-01-09T11:30:00Z"]), "is_interpolated": [False]}
    )
    result = match_intervals(actuals, forecasts)
    assert result.iloc[0]["error_mw"] == 5
    assert pd.isna(result.iloc[1]["forecast_mw"])


def test_accuracy_metrics():
    matched = pd.DataFrame({"forecast_mw": [110.0, 80.0], "actual_mw": [100.0, 100.0]})
    metrics = calculate_metrics(matched)
    assert metrics["mae_mw"] == 15
    assert metrics["rmse_mw"] == pytest.approx((250) ** 0.5)
    assert metrics["bias_mw"] == -5
    assert metrics["average_forecast_mw"] == 95
    assert metrics["average_actual_mw"] == 100


def test_missing_data_is_reported_and_excluded_from_metrics():
    matched = pd.DataFrame({"forecast_mw": [110.0, None], "actual_mw": [100.0, 90.0]})
    metrics = calculate_metrics(matched)
    assert metrics["matched_intervals"] == 1
    assert metrics["missing_intervals"] == 1
    assert metrics["mae_mw"] == 10


def test_empty_inputs_are_handled():
    actuals = prepare_actuals([], DAY)
    forecasts = select_forecasts([], DAY, CUTOFF)
    matched = match_intervals(actuals, forecasts)
    metrics = calculate_metrics(matched)
    assert matched.empty
    assert metrics["mae_mw"] is None
    assert metrics["matched_intervals"] == 0
