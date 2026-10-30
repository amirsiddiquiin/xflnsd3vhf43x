from __future__ import annotations

from datetime import date
import os

import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .analytics import (
    calculate_metrics,
    decision_cutoff,
    match_intervals,
    prepare_actuals,
    select_forecasts,
)
from .elexon import ElexonError, fetch_day_data
from .schemas import Interval, Metrics, WindDataResponse

app = FastAPI(title="UK Wind Forecast Dashboard API", version="1.0.0")
cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


def _optional_float(value: object) -> float | None:
    return None if pd.isna(value) else float(value)


def _optional_datetime(value: object):
    return None if pd.isna(value) else value.to_pydatetime()


@app.get("/api/wind-data", response_model=WindDataResponse)
async def wind_data(
    selected_date: date = Query(
        alias="date",
        description="Delivery date for a January 2026 purchasing decision (2 Jan–1 Feb)",
    ),
) -> WindDataResponse:
    if selected_date < date(2026, 1, 2) or selected_date > date(2026, 2, 1):
        raise HTTPException(
            status_code=422,
            detail=(
                "Delivery date must be from 2 January through 1 February 2026 "
                "to represent purchasing decisions made in January 2026"
            ),
        )

    cutoff = decision_cutoff(selected_date)
    try:
        actual_records, forecast_records = await fetch_day_data(selected_date, cutoff)
    except ElexonError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    actuals = prepare_actuals(actual_records, selected_date)
    forecasts = select_forecasts(forecast_records, selected_date, cutoff)
    matched = match_intervals(actuals, forecasts)
    metrics = Metrics(**calculate_metrics(matched))

    intervals = [
        Interval(
            start_time=row.start_time.to_pydatetime(),
            actual_mw=_optional_float(row.actual_mw),
            forecast_mw=_optional_float(row.forecast_mw),
            error_mw=_optional_float(row.error_mw),
            forecast_publish_time=_optional_datetime(row.forecast_publish_time),
            is_interpolated=bool(row.is_interpolated) if not pd.isna(row.is_interpolated) else False,
        )
        for row in matched.itertuples(index=False)
    ]

    return WindDataResponse(
        delivery_date=selected_date,
        decision_cutoff=cutoff,
        timezone="Europe/London",
        metrics=metrics,
        intervals=intervals,
        methodology=(
            "Latest hourly WINDFOR points published on or before 12:00 Europe/London on the prior day. "
            "The 24 intervening half-hours are linear estimates used only to align with the 48 FUELHH outturn intervals; "
            "no forecast published after the cutoff is used."
        ),
    )
