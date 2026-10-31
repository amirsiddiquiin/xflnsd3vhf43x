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
      <path d="M5 11h14.5c3.8 0 3.8-5.5.2-5.5-2 0-3.1 1.2-3.4 2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 17h20c4 0 4 6 0 6-2 0-3.2-1.2-3.5-2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 23h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
      <header className="app-header border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-feature text-white"><WindMark /></div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[-0.02em]">Wind Intelligence</p>
              <p className="text-[10px] font-medium text-muted sm:text-[11px]">Day-ahead decision workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-muted sm:gap-3 sm:text-[11px]">
            <span className="hidden rounded-full border border-line bg-canvas px-3 py-1.5 sm:inline">January 2026</span>
            <span className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5"><i className="status-dot" />Elexon live data</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-4 pb-12 pt-7 sm:px-6 sm:pt-10 lg:pb-16">
        <div className="page-intro mb-7 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="max-w-2xl">
            <p className="section-kicker">January 2026 · National wind</p>
            <h1 className="mt-2 text-[2rem] font-semibold leading-[1.08] tracking-[-0.045em] text-ink sm:text-[2.75rem]">Forecast confidence,<br className="hidden sm:block" /> made practical.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">See the forecast available at the buying cutoff, compare it with national outturn, and understand the miss before making the next decision.</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-4 shadow-panel">
            <p className="field-label">Analysis scope</p>
            <div className="mt-3 grid grid-cols-3 divide-x divide-line text-center">
              <div><strong className="block font-mono text-sm text-ink">GB</strong><span className="text-[10px] text-muted">National</span></div>
              <div><strong className="block font-mono text-sm text-ink">30m</strong><span className="text-[10px] text-muted">Intervals</span></div>
              <div><strong className="block font-mono text-sm text-ink">MW</strong><span className="text-[10px] text-muted">Measure</span></div>
            </div>
          </div>
        </div>

        {loading && !data && <LoadingState />}

        {!loading && error && (
          <section className="rounded-[24px] border border-danger/20 bg-white px-6 py-14 text-center shadow-panel">
            <h2 className="text-lg font-semibold">This delivery day could not be retrieved</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">{error}</p>
            <button onClick={() => setRetry((value) => value + 1)} className="mt-5 rounded-md bg-feature px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-feature-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forecast">Try again</button>
          </section>
        )}

        {data && (
          <div className={`content-enter space-y-6 ${loading ? 'is-refreshing' : ''}`} aria-busy={loading}>
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

                <section className="chart-panel overflow-hidden rounded-[24px] border border-line bg-white shadow-panel">
                  <div className="flex flex-col justify-between gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-end sm:px-6">
                    <div>
                      <p className="section-kicker">Generation profile</p>
                      <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.025em] text-ink sm:text-xl">Forecast vs actual generation</h2>
                      <p className="mt-1 text-[11px] text-muted">30-minute delivery intervals · MW · Europe/London</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium">
                      <span className="flex items-center gap-2 text-muted"><i className="h-[2px] w-4 bg-chart-forecast" />Forecast</span>
                      <span className="flex items-center gap-2 text-muted"><i className="h-[2px] w-4 bg-chart-actual" />Actual</span>
                      <span className="flex items-center gap-2 text-muted"><i className="h-1.5 w-1.5 rounded-full border border-chart-forecast bg-white" />Published hour</span>
                    </div>
                  </div>
                  <div className="px-1 pb-3 pt-3 sm:px-3 sm:pb-4 lg:px-5"><WindChart intervals={data.intervals} /></div>
                  <div className="border-t border-line bg-canvas/60 px-5 py-3 text-[10px] leading-4 text-muted sm:px-6">
                    Forecast markers are directly published hourly WINDFOR points. Connecting half-hours are transparent linear estimates for alignment with FUELHH.
                  </div>
                </section>

                <InsightPanel metrics={data.metrics} />

                <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
                  <AccuracyPanel metrics={data.metrics} />
                  <DecisionRecord
                    methodology={data.methodology}
                    publications={forecastSummary.publications}
                    interpolated={forecastSummary.interpolated}
                  />
                </div>

                <footer className="flex flex-col justify-between gap-2 border-t border-line pt-5 text-[10px] font-medium text-muted sm:flex-row">
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
