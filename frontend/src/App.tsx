import { useEffect, useMemo, useState } from 'react'
import { AccuracyPanel } from './components/AccuracyPanel'
import { DecisionRecord } from './components/DecisionRecord'
import { LoadingState } from './components/LoadingState'
import { OverviewMetrics } from './components/OverviewMetrics'
import { WindChart } from './components/WindChart'
import { dateLabel, dateTimeLabel } from './format'
import type { WindData } from './types'

function WindMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
      <path d="M4 10.5h15.5c3.8 0 3.8-5.5.2-5.5-2 0-3.1 1.2-3.4 2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 16h21c4 0 4 6 0 6-2 0-3.2-1.2-3.5-2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 22h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function App() {
  const [selectedDate, setSelectedDate] = useState('2026-01-15')
  const [data, setData] = useState<WindData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/wind-data?date=${selectedDate}`, { signal: controller.signal })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.detail ?? 'Unable to load Elexon data')
        setData(payload)
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === 'AbortError') return
        setData(null)
        setError(reason instanceof Error ? reason.message : 'Unable to load Elexon data')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [selectedDate, retry])

  const forecastSummary = useMemo(() => {
    if (!data) return { publications: [] as string[], interpolated: 0 }
    return {
      publications: Array.from(new Set(
        data.intervals.map((item) => item.forecast_publish_time).filter((value): value is string => Boolean(value)),
      )).sort(),
      interpolated: data.intervals.filter((item) => item.is_interpolated).length,
    }
  }, [data])

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="h-1 bg-forest" />
      <header className="border-b border-line bg-paper/95">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-forest/15 bg-forest text-mint"><WindMark /></div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">Wind Intelligence</p>
              <p className="text-xs text-muted">Great Britain · National view</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted sm:flex"><span className="status-dot" />Live Elexon data</div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 pb-10 pt-8 sm:px-8 lg:px-12 lg:pb-14 lg:pt-10">
        <section className="grid gap-7 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="eyebrow">Day-ahead forecast performance</p>
            <h1 className="mt-3 max-w-2xl text-[2rem] font-medium leading-[1.08] tracking-[-0.045em] text-ink sm:text-[2.65rem]">
              See what the market knew—and what the wind delivered.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-[15px]">
              A decision-time view of national wind generation forecasts, measured against the resulting outturn.
            </p>
          </div>

          <label className="group block w-full lg:w-[270px]">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Delivery date</span>
            <div className="relative border-b border-ink/30 transition-colors duration-200 group-focus-within:border-forest">
              <input
                type="date" min="2026-01-01" max="2026-01-31" value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="h-12 w-full appearance-none bg-transparent pr-8 text-[17px] font-medium tabular-nums text-ink outline-none"
              />
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-0 top-3 h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M6.5 3.5v3M17.5 3.5v3M4 9h16M5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5Z" />
              </svg>
            </div>
            <span className="mt-2 block text-xs text-muted">January 2026 analysis window</span>
          </label>
        </section>

        {loading && <LoadingState />}

        {!loading && error && (
          <section className="my-12 border border-danger/20 bg-paper px-6 py-12 text-center">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-sm font-semibold text-danger">!</div>
            <h2 className="mt-4 text-lg font-semibold">We couldn’t retrieve this delivery day</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">{error}</p>
            <button onClick={() => setRetry((value) => value + 1)} className="mt-6 border-b border-ink pb-1 text-sm font-semibold text-ink transition-colors duration-200 hover:border-forest hover:text-forest">Try the request again</button>
          </section>
        )}

        {!loading && data && (
          <div key={data.delivery_date} className="content-enter">
            <section className="py-7" aria-label="Decision context">
              <div className="decision-rail grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center">
                <div>
                  <p className="micro-label">Forecast locked</p>
                  <p className="mt-1 text-sm font-medium tabular-nums text-ink">{dateTimeLabel.format(new Date(data.decision_cutoff))}</p>
                </div>
                <div className="hidden h-px w-10 bg-line sm:block" />
                <div>
                  <p className="micro-label">Delivered</p>
                  <p className="mt-1 text-sm font-medium text-ink">{dateLabel.format(new Date(`${data.delivery_date}T12:00:00Z`))}</p>
                </div>
                <span className="justify-self-start border border-success/20 bg-success-wash px-2.5 py-1 text-[11px] font-semibold text-success sm:justify-self-end">{data.metrics.matched_intervals}/48 intervals matched</span>
              </div>
            </section>

            <OverviewMetrics metrics={data.metrics} />

            <section className="mt-6 border border-line bg-paper shadow-fine">
              <div className="flex flex-col justify-between gap-5 border-b border-line px-5 py-5 sm:flex-row sm:items-end sm:px-7 lg:px-8">
                <div>
                  <p className="eyebrow">Generation profile</p>
                  <h2 className="mt-2 text-xl font-medium tracking-[-0.025em] sm:text-2xl">Forecast against actual</h2>
                  <p className="mt-1.5 text-xs text-muted">Half-hourly delivery intervals · MW · Europe/London</p>
                </div>
                <div className="flex items-center gap-5 text-xs font-medium">
                  <span className="flex items-center gap-2 text-muted"><i className="h-[2px] w-5 bg-forecast" />Forecast</span>
                  <span className="flex items-center gap-2 text-muted"><i className="h-[2px] w-5 bg-actual" />Actual</span>
                </div>
              </div>
              {data.intervals.length ? (
                <div className="px-2 pb-3 pt-4 sm:px-5 sm:pb-5 lg:px-7"><WindChart intervals={data.intervals} /></div>
              ) : (
                <div className="m-6 border border-dashed border-line py-20 text-center text-sm text-muted">No intervals were returned for this date.</div>
              )}
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_.92fr]">
              <AccuracyPanel metrics={data.metrics} />
              <DecisionRecord decisionCutoff={data.decision_cutoff} methodology={data.methodology} publications={forecastSummary.publications} interpolated={forecastSummary.interpolated} />
            </div>

            <footer className="mt-10 flex flex-col justify-between gap-3 border-t border-line pt-5 text-[11px] text-muted sm:flex-row">
              <span>Data source: Elexon Insights · FUELHH & WINDFOR</span>
              <span>Analysis scope: Great Britain · January 2026</span>
            </footer>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
