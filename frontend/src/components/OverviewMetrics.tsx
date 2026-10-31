import { useEffect, useRef, useState } from 'react'
import type { Metrics } from '../types'

const number = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })
const value = (input: number | null) => input === null ? '—' : number.format(input)
const signedValue = (input: number | null) => input === null ? '—' : `${input > 0 ? '+' : ''}${number.format(input)}`

interface MetricProps {
  label: string
  value: string
  note: string
  primary?: boolean
}

function Metric({ label, value: metricValue, note, primary = false }: MetricProps) {
  const previousValue = useRef(metricValue)
  const frame = useRef<number | null>(null)
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    if (previousValue.current === metricValue) return
    previousValue.current = metricValue
    setChanging(false)
    frame.current = requestAnimationFrame(() => setChanging(true))
    const timer = window.setTimeout(() => setChanging(false), 260)
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      window.clearTimeout(timer)
    }
  }, [metricValue])

  return (
    <div className={`metric-cell min-w-0 rounded-[20px] border border-line bg-white p-4 shadow-panel sm:p-5 ${primary ? 'metric-primary' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="field-label">{label}</p>
        {primary && <span className="h-1.5 w-1.5 rounded-full bg-forecast" aria-hidden="true" />}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <strong
          className={`metric-number font-mono text-ink ${changing ? 'metric-value-change' : ''} ${primary ? 'text-[1.85rem] sm:text-[2.1rem]' : 'text-[1.45rem] sm:text-[1.65rem]'}`}
          aria-live="polite"
        >{metricValue}</strong>
        <span className="text-[10px] font-medium text-muted">MW</span>
      </div>
      <p className="mt-2 text-[11px] leading-4 text-muted">{note}</p>
    </div>
  )
}

export function OverviewMetrics({ metrics }: { metrics: Metrics }) {
  const biasNote = metrics.bias_mw === null
    ? 'Direction unavailable'
    : metrics.bias_mw > 0
      ? 'Forecast above actual'
      : metrics.bias_mw < 0
        ? 'Forecast below actual'
        : 'Balanced on average'

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Forecast overview">
      <Metric label="Expected wind" value={value(metrics.average_forecast_mw)} note="Average at decision time" primary />
      <Metric label="Actual generation" value={value(metrics.average_actual_mw)} note="Average national outturn" primary />
      <Metric label="Forecast bias" value={signedValue(metrics.bias_mw)} note={biasNote} />
      <Metric label="MAE" value={value(metrics.mae_mw)} note="Typical absolute miss" />
      <Metric label="RMSE" value={value(metrics.rmse_mw)} note="Weights larger misses" />
    </section>
  )
}
