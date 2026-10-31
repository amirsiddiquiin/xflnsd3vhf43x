import { useEffect, useMemo, useState } from 'react'
import { AccuracyPanel } from './components/AccuracyPanel'
import { DecisionContext } from './components/DecisionContext'
import { DecisionRecord } from './components/DecisionRecord'
import { InsightPanel } from './components/InsightPanel'
import { LoadingState } from './components/LoadingState'
import { OverviewMetrics } from './components/OverviewMetrics'
import { WindChart } from './components/WindChart'
import type { WindData } from './types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function WindMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" aria-hidden="true">
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
        const response = await fetch(`${API_BASE_URL}/api/wind-data?date=${selectedDate}`, { signal: controller.signal })
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
      <header className="app-header border-b border-line/80 bg-white">
        <div className="mx-auto flex h-[60px] max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-feature text-chart-forecast"><WindMark /></div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[-0.015em]">Wind Intelligence</p>
              <p className="text-[10px] text-muted sm:text-[11px]">Day-ahead decision workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted sm:gap-5">
            <span className="hidden sm:inline">January 2026</span>
            <span className="flex items-center gap-2"><i className="status-dot" />Elexon data</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-7">
        <div className="page-intro mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="section-kicker">January 2026 purchase decisions</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] sm:text-[1.75rem]">Day-ahead forecast performance</h1>
          </div>
          <p className="max-w-lg text-xs leading-5 text-muted sm:text-right">Forecast available at purchase cutoff compared with national wind outturn.</p>
        </div>

        {loading && !data && <LoadingState />}

        {!loading && error && (
          <section className="rounded-xl border border-danger/20 bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-semibold">This delivery day could not be retrieved</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">{error}</p>
            <button onClick={() => setRetry((value) => value + 1)} className="mt-5 rounded-md bg-feature px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-feature-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forecast">Try again</button>
          </section>
        )}

        {data && (
          <div className={`content-enter space-y-5 ${loading ? 'is-refreshing' : ''}`} aria-busy={loading}>
            <DecisionContext
              deliveryDate={data.delivery_date}
              decisionCutoff={data.decision_cutoff}
              publicationTime={forecastSummary.publications.at(-1) ?? null}
              matchedIntervals={data.metrics.matched_intervals}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              refreshing={loading}
            />

            {data.intervals.length === 0 ? (
              <section className="border-y border-line py-12 text-center">
                <h2 className="text-base font-semibold text-ink">No aligned wind data is available for this delivery date</h2>
                <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-muted">Choose another delivery date in the January decision window. Previously loaded values are not shown.</p>
              </section>
            ) : (
              <>
                <OverviewMetrics metrics={data.metrics} />

                <section className="chart-panel overflow-hidden rounded-[14px] bg-feature shadow-chart">
                  <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-end sm:px-6">
                    <div>
                      <p className="section-kicker text-chart-forecast">Generation profile</p>
                      <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">Forecast vs actual generation</h2>
                      <p className="mt-1 text-[11px] text-chart-muted">30-minute delivery intervals · MW · Europe/London</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px]">
                      <span className="flex items-center gap-2 text-chart-muted"><i className="h-[2px] w-4 bg-chart-forecast" />Forecast</span>
                      <span className="flex items-center gap-2 text-chart-muted"><i className="h-[2px] w-4 bg-chart-actual" />Actual</span>
                      <span className="flex items-center gap-2 text-chart-muted"><i className="h-1.5 w-1.5 rounded-full border border-chart-forecast bg-feature" />Published hour</span>
                    </div>
                  </div>
                  <div className="px-1 pb-3 pt-3 sm:px-3 sm:pb-4 lg:px-5"><WindChart intervals={data.intervals} /></div>
                  <div className="border-t border-white/10 px-5 py-2.5 text-[10px] leading-4 text-chart-muted sm:px-6">
                    Forecast markers are directly published hourly WINDFOR points. Connecting half-hours are transparent linear estimates for alignment with FUELHH.
                  </div>
                </section>

                <InsightPanel metrics={data.metrics} />

                <div className="grid gap-5 border-t border-line pt-5 lg:grid-cols-[.9fr_1.1fr]">
                  <AccuracyPanel metrics={data.metrics} />
                  <DecisionRecord
                    methodology={data.methodology}
                    publications={forecastSummary.publications}
                    interpolated={forecastSummary.interpolated}
                  />
                </div>

                <footer className="flex flex-col justify-between gap-2 border-t border-line pt-4 text-[10px] text-muted sm:flex-row">
                  <span>Source: Elexon Insights · FUELHH & WINDFOR</span>
                  <span>National view · Great Britain · January 2026 decision window</span>
                </footer>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
