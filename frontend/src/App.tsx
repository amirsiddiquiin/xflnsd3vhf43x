import { useEffect, useMemo, useState } from 'react'
import { LoadingState } from './components/LoadingState'
import { MetricCard } from './components/MetricCard'
import { WindChart } from './components/WindChart'
import type { WindData } from './types'

const dateLabel = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/London',
})
const dateTimeLabel = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/London',
  timeZoneName: 'short',
})
const timeLabel = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/London',
})

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
    const publications = Array.from(
      new Set(data.intervals.map((item) => item.forecast_publish_time).filter((value): value is string => Boolean(value))),
    ).sort()
    return {
      publications,
      interpolated: data.intervals.filter((item) => item.is_interpolated).length,
    }
  }, [data])

  return (
    <div className="min-h-screen bg-mist text-ink">
      <header className="relative overflow-hidden bg-[#081c1a] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_75%_20%,#2bd4ad_0,transparent_28%),radial-gradient(circle_at_15%_120%,#155f51_0,transparent_36%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 ring-1 ring-teal-400/30">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-teal-300" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M3 15.5h7.5c2.5 0 2.5-3.5.1-3.5H8" strokeLinecap="round" />
                    <path d="M3 9h12.5c3.3 0 3.3-5 0-5-1.5 0-2.4.9-2.6 2" strokeLinecap="round" />
                    <path d="M3 19h13.5c3.3 0 3.3-5 0-5-1.5 0-2.4.9-2.6 2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">Elexon market insights</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">UK Wind Generation<br className="hidden sm:block" /> Forecast Dashboard</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Compare the day-ahead wind forecast available to the purchasing team with actual national generation.
              </p>
            </div>

            <label className="block w-full max-w-xs rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Delivery date</span>
              <input
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white px-3 py-2.5 font-semibold text-ink outline-none ring-teal-400 transition focus:ring-2"
              />
            </label>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        {loading && <LoadingState />}

        {!loading && error && (
          <section className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-card">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">!</div>
            <h2 className="mt-4 text-lg font-semibold">Data could not be loaded</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">{error}</p>
            <button onClick={() => setRetry((value) => value + 1)} className="mt-5 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white">Try again</button>
          </section>
        )}

        {!loading && data && (
          <div className="space-y-7">
            <section className="grid gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Delivery date</p>
                <p className="mt-1 text-base font-semibold">{dateLabel.format(new Date(`${data.delivery_date}T12:00:00Z`))}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Purchase decision cutoff</p>
                <p className="mt-1 text-base font-semibold">{dateTimeLabel.format(new Date(data.decision_cutoff))}</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                  <span className="h-2 w-2 rounded-full bg-teal-500" />
                  {data.metrics.matched_intervals} intervals matched
                </span>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Average forecast" value={data.metrics.average_forecast_mw} accent="teal" helper="Mean selected day-ahead forecast" />
              <MetricCard label="Average actual" value={data.metrics.average_actual_mw} accent="coral" helper="Mean metered WIND generation" />
              <MetricCard label="Mean absolute error" value={data.metrics.mae_mw} accent="slate" helper="Typical size of the forecast miss" />
              <MetricCard label="Forecast bias" value={data.metrics.bias_mw} accent="slate" helper="Positive means over-forecasting" />
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-7">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Daily profile</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">Forecast vs actual generation</h2>
                  <p className="mt-1 text-sm text-slate-500">Thirty-minute delivery intervals · National WIND generation</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">All times Europe/London</div>
              </div>
              {data.intervals.length ? (
                <div className="mt-5"><WindChart intervals={data.intervals} /></div>
              ) : (
                <div className="mt-6 rounded-xl bg-slate-50 py-16 text-center text-sm text-slate-500">No intervals were returned for this date.</div>
              )}
            </section>

            <div className="grid gap-7 lg:grid-cols-[1.25fr_.75fr]">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Forecast availability</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">What was known at the cutoff</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">Only forecasts published by the purchasing cutoff are eligible. The latest eligible publication is selected independently for each source interval.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">{forecastSummary.publications.length === 1 ? 'Selected publication' : 'Publication range used'}</p>
                    <p className="mt-2 text-sm font-semibold">
                      {forecastSummary.publications.length === 1
                        ? dateTimeLabel.format(new Date(forecastSummary.publications[0]))
                        : forecastSummary.publications.length > 1
                          ? `${timeLabel.format(new Date(forecastSummary.publications[0]))}–${timeLabel.format(new Date(forecastSummary.publications.at(-1)!))}`
                        : 'No eligible publication'}
                    </p>
                    {forecastSummary.publications.length > 1 && <p className="mt-1 text-xs text-slate-500">{dateLabel.format(new Date(forecastSummary.publications.at(-1)!))}</p>}
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">Half-hour estimates</p>
                    <p className="mt-2 text-sm font-semibold">{forecastSummary.interpolated} interpolated intervals</p>
                    <p className="mt-1 text-xs text-slate-500">From Elexon hourly WINDFOR points</p>
                  </div>
                </div>
                <p className="mt-4 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3 text-xs leading-5 text-teal-700">{data.methodology}</p>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Accuracy</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">How to read the metrics</h2>
                <dl className="mt-5 space-y-4 text-sm">
                  <div><dt className="font-semibold">Error</dt><dd className="mt-1 text-slate-500">Forecast − Actual for each interval.</dd></div>
                  <div><dt className="font-semibold">MAE</dt><dd className="mt-1 text-slate-500">Average absolute error; lower is better.</dd></div>
                  <div><dt className="font-semibold">RMSE · {data.metrics.rmse_mw === null ? '—' : `${Math.round(data.metrics.rmse_mw).toLocaleString('en-GB')} MW`}</dt><dd className="mt-1 text-slate-500">Weights larger misses more heavily.</dd></div>
                  <div><dt className="font-semibold">Bias</dt><dd className="mt-1 text-slate-500">Shows systematic over- or under-forecasting.</dd></div>
                </dl>
                {data.metrics.missing_intervals > 0 && <p className="mt-5 text-xs text-amber-700">{data.metrics.missing_intervals} interval(s) excluded due to missing data.</p>}
              </section>
            </div>

            <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
              <span>Source: Elexon Insights API · FUELHH and WINDFOR</span>
              <span>Decision assumption: 12:00 London time, prior day</span>
            </footer>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
