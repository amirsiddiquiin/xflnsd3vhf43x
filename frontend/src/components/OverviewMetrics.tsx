import type { Metrics } from '../types'

const number = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })
const value = (input: number | null) => input === null ? '—' : number.format(input)
const signedValue = (input: number | null) => input === null ? '—' : `${input > 0 ? '+' : ''}${number.format(input)}`

export function OverviewMetrics({ metrics }: { metrics: Metrics }) {
  const biasDirection = metrics.bias_mw === null
    ? 'Direction unavailable'
    : metrics.bias_mw > 0
      ? 'Forecast above outturn'
      : metrics.bias_mw < 0
        ? 'Forecast below outturn'
        : 'Forecast balanced'

  return (
    <section className="border border-line bg-paper shadow-fine" aria-label="Forecast overview">
      <div className="grid lg:grid-cols-[1fr_1fr_.82fr]">
        <article className="relative border-b border-line p-5 sm:p-7 lg:border-b-0 lg:border-r lg:p-8">
          <div className="absolute left-0 top-0 h-full w-[3px] bg-forecast" />
          <p className="micro-label">Average day-ahead forecast</p>
          <div className="mt-5 flex items-end gap-2">
            <strong className="metric-number text-4xl text-ink sm:text-[3.35rem]">{value(metrics.average_forecast_mw)}</strong>
            <span className="mb-1.5 text-xs font-semibold text-muted">MW</span>
          </div>
          <p className="mt-4 max-w-xs text-xs leading-5 text-muted">The generation expected when the purchase decision was made.</p>
        </article>

        <article className="relative border-b border-line p-5 sm:p-7 lg:border-b-0 lg:border-r lg:p-8">
          <div className="absolute left-0 top-0 h-full w-[3px] bg-actual" />
          <p className="micro-label">Average actual generation</p>
          <div className="mt-5 flex items-end gap-2">
            <strong className="metric-number text-4xl text-ink sm:text-[3.35rem]">{value(metrics.average_actual_mw)}</strong>
            <span className="mb-1.5 text-xs font-semibold text-muted">MW</span>
          </div>
          <p className="mt-4 max-w-xs text-xs leading-5 text-muted">The measured national wind outturn across the delivery day.</p>
        </article>

        <article className="grid grid-cols-2 divide-x divide-line lg:block lg:divide-x-0">
          <div className="p-5 sm:p-7 lg:p-8">
            <p className="micro-label">Average error</p>
            <p className="metric-number mt-3 text-2xl text-ink">{signedValue(metrics.bias_mw)} <span className="text-xs font-semibold text-muted">MW</span></p>
            <p className="mt-2 text-[11px] leading-4 text-muted">{biasDirection}</p>
          </div>
          <div className="p-5 sm:p-7 lg:border-t lg:border-line lg:p-8">
            <p className="micro-label">Typical miss · MAE</p>
            <p className="metric-number mt-3 text-2xl text-ink">{value(metrics.mae_mw)} <span className="text-xs font-semibold text-muted">MW</span></p>
            <p className="mt-2 text-[11px] leading-4 text-muted">Absolute interval error</p>
          </div>
        </article>
      </div>
    </section>
  )
}
