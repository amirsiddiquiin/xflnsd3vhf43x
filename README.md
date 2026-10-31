# UK Wind Generation Forecast Dashboard

A full-stack analytical dashboard for evaluating **day-ahead wind generation forecasts against actual national wind generation in Great Britain**.

Built as part of a Full Stack Software Engineer hiring assignment, the application helps electricity purchasing teams understand what wind generation was forecast at the time of a purchasing decision and how accurate those forecasts proved to be.

The dashboard uses historical data from the official **Elexon Insights API**. Forecast and actual generation values are retrieved through the application backend rather than hardcoded into the interface.

## Live Application

**Dashboard:** https://wind-forecast-assignment.vercel.app/

**GitHub Repository:** https://github.com/amirsiddiquiin/xflnsd3vhf43x

The dashboard focuses on **purchasing decisions made during January 2026**, including the corresponding delivery periods.

## Features

- **Day-ahead forecast analysis:** Displays the latest eligible wind generation forecast available before the assumed purchasing decision cutoff.
- **Forecast vs actual visualization:** Interactive chart comparing expected and actual national wind generation.
- **Forecast accuracy metrics:** Calculates Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and forecast bias.
- **Decision chronology:** Displays forecast publication time, purchasing cutoff, and delivery date.
- **Historical date selection:** Supports the January 2026 purchasing decision window.
- **Transparent data alignment:** Distinguishes directly published hourly forecast observations from derived half-hourly estimates.
- **Business interpretation:** Explains forecast overestimation or underestimation in the context of electricity purchasing decisions.
- **Responsive interface:** Designed for clear data exploration across desktop and smaller screens.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Visualization | Recharts |
| Backend | Python, FastAPI |
| Data processing | Pandas |
| HTTP client | HTTPX |
| Containerization | Docker, Docker Compose |
| Deployment | Vercel |
| Data source | Elexon Insights API |

## Project Structure

```text
xflnsd3vhf43x/
├── backend/
│   ├── app/                  # API routes, Elexon client, analytics and schemas
│   ├── tests/                # Analytics and API regression tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/                  # React components, chart, styles and types
│   ├── Dockerfile
│   └── nginx.conf            # Static hosting and /api reverse proxy
├── docker-compose.yml        # Local frontend and backend stack
└── README.md
```

The project separates frontend presentation from backend data retrieval and analysis.

## Getting Started

### Prerequisites

For Docker-based execution:

- Docker
- Docker Compose

For local development:

- Python 3.12 (recommended)
- Node.js and npm

### Option 1: Run with Docker

From the project root:

```bash
docker compose up --build
```

Once the containers are running:

| Service | URL |
|---|---|
| Frontend dashboard | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Interactive API documentation | http://localhost:8000/docs |

Docker Compose starts the frontend and backend services together.

### Option 2: Run Locally

**Start the Python backend**

```bash
cd backend

python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

The backend runs at:

http://localhost:8000

**Start the React frontend**

Open another terminal:

```bash
cd frontend

npm install
npm run dev
```

The frontend runs at:

http://localhost:5173

During local development, Vite proxies `/api` requests to the backend on port 8000.

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | Backend health check |
| `GET /api/wind-data?date=2026-01-15` | Forecast and actual generation analysis for a selected delivery date |

### Date Parameter

The `date` parameter represents the **electricity delivery date**, not the purchasing decision date.

Supported delivery dates range from **2 January 2026 through 1 February 2026**, corresponding to purchasing decision dates from 1–31 January 2026 under the assumed prior-day cutoff.

For example:

```text
Purchase decision: 14 January 2026
Delivery date:     15 January 2026
```

This distinction ensures that the January 31 purchasing decision is included, even though its associated delivery occurs on February 1.

## Data Sources

The application uses two official Elexon Insights datasets.

### 1. FUELHH — Actual Generation

Endpoint:

https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream

Used to retrieve actual electricity generation observations.

The backend filters records to:

```text
fuelType = WIND
```

Actual generation is evaluated at half-hourly delivery intervals.

### 2. WINDFOR — Wind Generation Forecasts

Endpoint:

https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream

Used to retrieve historical wind generation forecasts.

Important fields include:

- `startTime` — Forecast delivery interval.
- `publishTime` — Time when the forecast was published.
- `generation` — Forecast wind generation in MW.

The publication timestamp allows the application to determine which forecasts were available before the purchasing decision.

No API key was required for these endpoints at the time of implementation.

## Forecast Selection Methodology

The dashboard reconstructs the forecast information available at a historical day-ahead purchasing decision.

### Purchasing Cutoff Assumption

The assumed purchasing cutoff is:

**12:00 Europe/London on the calendar day before electricity delivery.**

This is an analytical assumption, not a claim that noon is the official deadline for every electricity purchasing arrangement.

The cutoff is configured in:

`backend/app/analytics.py`

### Data Processing Steps

1. **Retrieve actual generation:** Request FUELHH data for the selected delivery date and filter to wind generation.
2. **Retrieve historical forecasts:** Request WINDFOR observations from the three days preceding the purchasing cutoff through the cutoff.
3. **Exclude future information:** Remove every forecast with a `publishTime` later than the decision cutoff.
4. **Select eligible forecasts:** For each forecast delivery timestamp, retain the latest forecast published on or before the cutoff.
5. **Handle duplicates:** For duplicate actual records, retain the latest publication according to the implemented deduplication rule.
6. **Normalize timestamps:** Use UTC internally and Europe/London for the business cutoff and user-facing display.
7. **Align intervals:** Match forecast observations with actual generation intervals, applying the documented interpolation rules where necessary.
8. **Calculate errors:** Compare eligible forecast values against actual generation.
9. **Report completeness:** Exclude unmatched intervals from accuracy calculations and report the number of matched observations.

### Preventing Look-Ahead Bias

The central forecast eligibility rule is:

```text
forecast.publishTime <= purchasingCutoff
```

This prevents forecasts published after the historical purchasing decision from being included in the evaluation.

Without this restriction, an accuracy analysis could unintentionally benefit from information that was not available when the purchasing decision was made.

### Hourly-to-Half-Hourly Alignment

WINDFOR provides hourly forecast observations, while FUELHH actual generation is available at half-hourly intervals.

To support interval-level comparison, the application uses linear interpolation for a single intervening half-hour between adjacent hourly forecast observations.

For example:

```text
10:00  Published forecast
10:30  Derived half-hour estimate
11:00  Published forecast
```

The application does not extrapolate missing starting or ending observations or interpolate across missing source hours.

Derived values are identified in the API response and dashboard.

**Methodological limitation:** Interpolated half-hourly values are estimates, not independently published Elexon forecasts. Accuracy metrics calculated using these values should be interpreted accordingly.

## Forecast Accuracy Metrics

For each matched delivery interval, the forecast error is defined as:

```text
Error = Forecast Generation - Actual Generation
```

All three metrics are expressed in megawatts (MW).

### Mean Absolute Error (MAE)

Measures the average magnitude of forecast errors, regardless of direction.

```text
MAE = mean(abs(Forecast - Actual))
```

A lower MAE indicates smaller average forecast errors.

### Root Mean Squared Error (RMSE)

Measures forecast error while assigning greater weight to larger deviations.

```text
RMSE = sqrt(mean((Forecast - Actual)^2))
```

A lower RMSE indicates fewer or smaller large forecast errors.

### Forecast Bias

Measures whether the forecast systematically overestimates or underestimates generation.

```text
Bias = mean(Forecast - Actual)
```

Interpretation:

- **Positive bias:** Forecast generation was higher than actual generation.
- **Negative bias:** Forecast generation was lower than actual generation.
- **Bias near zero:** Average signed error is small, although individual forecast errors may still be significant.

Only matched observations are included in the calculations.

## Dashboard Design

The dashboard is organized around the purchasing decision workflow.

**Decision context:** Shows forecast publication time, assumed purchasing cutoff, and electricity delivery date.

**Generation overview:** Presents expected generation, actual generation, and forecast bias.

**Generation profile:** Compares forecast and actual wind generation across delivery intervals.

**Forecast accuracy:** Displays MAE and RMSE with concise explanations.

**Decision insight:** Provides a business-oriented interpretation of the forecast error.

**Methodology:** Explains how historical forecasts were selected and aligned with actual observations.

The interface is intentionally focused on the assignment requirements rather than additional unrelated functionality.

## Testing

Backend regression tests are included in:

`backend/tests/`

Run them using:

```bash
cd backend
pytest
```

The test suite covers:

- Wind fuel filtering
- Duplicate record handling
- Forecast selection using publication cutoffs
- Hourly-to-half-hourly interpolation
- Forecast and actual interval matching
- MAE, RMSE, and bias calculations
- Missing data and empty inputs
- API health endpoint
- Delivery date validation

These tests help validate the analytical logic independently of the frontend presentation.

## Deployment

**Live dashboard:**

https://wind-forecast-assignment.vercel.app/

**Public source repository:**

https://github.com/amirsiddiquiin/xflnsd3vhf43x

The application is available through its Vercel deployment.

The repository also includes Docker configuration for running the frontend and Python backend locally.

The live deployment and public repository should be tested in a private or incognito browser window before evaluation.

## Assumptions and Limitations

- The purchasing cutoff is assumed to be noon on the calendar day before delivery.
- Forecast accuracy is evaluated against historical national wind generation, not individual wind farms.
- Hourly forecast observations may be interpolated to align with half-hourly actual generation.
- Interpolated observations are identified separately from published forecast values.
- Missing or unmatched intervals are excluded from accuracy calculations.
- The three-day forecast lookback is a practical data retrieval choice.
- The dashboard does not estimate financial losses, electricity prices, or optimal purchasing volumes.
- Historical forecast accuracy does not guarantee future forecasting performance.
- Data availability and completeness depend on the upstream Elexon Insights API.

## AI Usage Disclosure

AI-assisted development tools were used to support project scaffolding, implementation, debugging, testing, documentation, and UI refinement.

The project was developed for this hiring assignment using the official Elexon datasets and documented analytical rules.

Forecast selection, timestamp alignment, accuracy calculations, and application behavior were reviewed against the intended methodology and historical Elexon responses.

## Project Purpose

This pilot demonstrates how historical wind forecasts can be evaluated from the perspective of a day-ahead electricity purchasing decision.

It aims to make forecast performance transparent, measurable, and understandable through a focused full-stack application.