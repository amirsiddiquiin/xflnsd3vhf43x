# UK Wind Generation Forecast Dashboard

A small full-stack hiring-assignment project that compares the wind forecast available at a day-ahead purchase decision with actual national wind generation. Data is requested live from the official Elexon Insights API; dashboard values are not hardcoded.

## Technology

- React, TypeScript, Tailwind CSS, Recharts and Vite
- FastAPI, Pandas and HTTPX
- Docker and Docker Compose

## Quick start with Docker

```bash
docker compose up --build
```

Open <http://localhost:3000>. The backend API and interactive docs are available at <http://localhost:8000/docs>.

## Local development

Backend (Python 3.12 recommended):

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend, in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/api` requests to the backend on port 8000.

## API

- `GET /api/health`
- `GET /api/wind-data?date=2026-01-15`

The date endpoint accepts only dates from 1–31 January 2026.

## Data logic and assumptions

The day-ahead purchase decision cutoff is assumed to be **12:00 Europe/London on the calendar day before delivery**. This is explicit and easy to change in `backend/app/analytics.py`.

For a chosen delivery date, the backend:

1. Requests FUELHH data by settlement date and filters defensively to `fuelType = WIND`.
2. Requests WINDFOR vintages from the three days preceding the cutoff through the cutoff itself.
3. Excludes every forecast whose `publishTime` is after the cutoff.
4. For each forecast `startTime`, keeps the latest eligible publication. Duplicate actual records similarly keep the latest publication.
5. Uses UTC internally and Europe/London for the business cutoff and display. This remains safe across daylight-saving transitions.
6. Linearly interpolates the hourly WINDFOR series onto the 30-minute FUELHH intervals. Interpolated intervals are identified in the API response.
7. Joins forecast and actual generation on delivery interval and calculates error as `forecast - actual`.
8. Excludes unmatched intervals from accuracy metrics and reports their count.

The three-day forecast lookback is intentionally wider than Elexon's normal publication cadence so the latest eligible vintage is still found if a scheduled update is missing.

## Metrics

- **MAE:** mean absolute value of interval errors.
- **RMSE:** square root of the mean squared interval error.
- **Bias:** mean error. Positive bias means over-forecasting; negative bias means under-forecasting.

## Tests

```bash
cd backend
pytest
```

The tests cover WIND filtering, duplicate handling, cutoff-based forecast selection, hourly-to-half-hour interpolation, interval matching, MAE, RMSE, bias, missing data, empty inputs, health, and date validation.

## Official data endpoints

- FUELHH stream: `https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream`
- WINDFOR stream: `https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream`

No API key is required by these endpoints at the time of implementation.
