from datetime import date, datetime

from pydantic import BaseModel


class Metrics(BaseModel):
    average_forecast_mw: float | None
    average_actual_mw: float | None
    mae_mw: float | None
    rmse_mw: float | None
    bias_mw: float | None
    matched_intervals: int
    missing_intervals: int


class Interval(BaseModel):
    start_time: datetime
    forecast_mw: float | None
    actual_mw: float | None
    error_mw: float | None
    forecast_publish_time: datetime | None
    is_interpolated: bool = False


class WindDataResponse(BaseModel):
    delivery_date: date
    decision_cutoff: datetime
    timezone: str
    metrics: Metrics
    intervals: list[Interval]
    methodology: str
