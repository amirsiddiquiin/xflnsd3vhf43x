from __future__ import annotations

import asyncio
from datetime import date, datetime, timedelta

import httpx

from .analytics import UTC

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1"
TIMEOUT = httpx.Timeout(30.0, connect=10.0)


class ElexonError(RuntimeError):
    pass


def _iso_z(value: datetime) -> str:
    return value.astimezone(UTC).isoformat().replace("+00:00", "Z")


async def _get(client: httpx.AsyncClient, path: str, params: dict) -> list[dict]:
    try:
        response = await client.get(path, params=params)
        response.raise_for_status()
        payload = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise ElexonError(f"Elexon request failed for {path}: {exc}") from exc
    if not isinstance(payload, list):
        raise ElexonError(f"Unexpected Elexon response for {path}")
    return payload


async def fetch_day_data(
    delivery_date: date, cutoff: datetime
) -> tuple[list[dict], list[dict]]:
    """Fetch actuals by settlement day and forecast vintages available before cutoff."""
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=TIMEOUT) as client:
        actual_task = _get(
            client,
            "/datasets/FUELHH/stream",
            {
                "settlementDateFrom": delivery_date.isoformat(),
                "settlementDateTo": delivery_date.isoformat(),
                "fuelType": "WIND",
            },
        )
        forecast_task = _get(
            client,
            "/datasets/WINDFOR/stream",
            {
                "publishDateTimeFrom": _iso_z(cutoff - timedelta(days=3)),
                "publishDateTimeTo": _iso_z(cutoff),
            },
        )
        return await asyncio.gather(actual_task, forecast_task)
