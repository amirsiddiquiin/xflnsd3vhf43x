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
  return (
    <div className={`min-w-0 bg-white px-3 py-4 sm:px-4 lg:px-5 ${primary ? 'md:py-5' : ''}`}>
      <p className="field-label">{label}</p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <strong className={`metric-number text-ink ${primary ? 'text-[1.8rem] sm:text-[2.15rem]' : 'text-[1.25rem] sm:text-[1.5rem] lg:text-[1.7rem]'}`}>{metricValue}</strong>
        <span className="text-[10px] font-medium text-muted">MW</span>
      </div>
      <p className="mt-1.5 text-[10px] leading-4 text-muted sm:text-[11px]">{note}</p>
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
    <section className="overflow-hidden rounded-xl border border-line bg-line" aria-label="Forecast overview">
      <div className="grid gap-px md:grid-cols-[2.3fr_2.75fr]">
        <div className="grid grid-cols-2 gap-px bg-line">
          <Metric label="Expected wind" value={value(metrics.average_forecast_mw)} note="Average at decision time" primary />
          <Metric label="Actual generation" value={value(metrics.average_actual_mw)} note="Average national outturn" primary />
        </div>
        <div className="grid grid-cols-3 gap-px bg-line">
          <Metric label="Forecast bias" value={signedValue(metrics.bias_mw)} note={biasNote} />
          <Metric label="MAE" value={value(metrics.mae_mw)} note="Typical absolute miss" />
          <Metric label="RMSE" value={value(metrics.rmse_mw)} note="Weights larger misses" />
        </div>
      </div>
    </section>
  )
}
