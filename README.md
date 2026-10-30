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

The `date` parameter is a **delivery date**. It accepts 2 January through 1 February 2026, which corresponds to purchasing decision cutoffs from 1–31 January under the prior-day noon assumption. This intentionally includes the 31 January decision/1 February delivery boundary and excludes the 31 December decision/1 January delivery boundary.

## Project structure

```text
wind-forecast-assignment/
├── backend/
│   ├── app/                 # FastAPI routes, Elexon client, analytics, schemas
│   ├── tests/               # Analytics and API regression tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/                 # React components, chart, styles and types
│   ├── Dockerfile
│   └── nginx.conf           # Static hosting and /api reverse proxy
├── docker-compose.yml       # Backend + frontend local stack
└── README.md
```

## Data logic and assumptions

The day-ahead purchase decision cutoff is assumed to be **12:00 Europe/London on the calendar day before delivery**. This is explicit and easy to change in `backend/app/analytics.py`.

For a chosen delivery date, the backend:

1. Requests FUELHH data by settlement date and filters defensively to `fuelType = WIND`.
2. Requests WINDFOR vintages from the three days preceding the cutoff through the cutoff itself.
3. Excludes every forecast whose `publishTime` is after the cutoff.
4. For each forecast `startTime`, keeps the latest eligible publication. Duplicate actual records similarly keep the latest publication.
5. Uses UTC internally and Europe/London for the business cutoff and display. This remains safe across daylight-saving transitions.
6. Linearly interpolates only the single half-hour between adjacent hourly WINDFOR points. It does not extrapolate missing start/end values or bridge a missing source hour. Interpolated intervals are identified in the API response and UI.
7. Joins forecast and actual generation on delivery interval and calculates error as `forecast - actual`.
8. Excludes unmatched intervals from accuracy metrics and reports their count.

The three-day forecast lookback is intentionally wider than Elexon's normal publication cadence so the latest eligible vintage is still found if a scheduled update is missing.

## Deployment

No public Vercel or Heroku deployment URL has been configured yet. The Dockerized application is ready for local or container-hosted evaluation, but the assignment is not submission-ready until a public deployment is created and its anonymous/incognito access is verified.

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

## AI usage disclosure

AI-assisted development was used to help scaffold, implement, test, and refine this hiring-assignment project. The data-selection rules, time alignment, calculations, generated code, and user interface were reviewed and validated against the official Elexon API behaviour and live historical responses.
