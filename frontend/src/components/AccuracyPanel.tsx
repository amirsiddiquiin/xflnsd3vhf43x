import type { Metrics } from '../types'

const format = (value: number | null) => value === null ? '—' : Math.round(value).toLocaleString('en-GB')

export function AccuracyPanel({ metrics }: { metrics: Metrics }) {
  const direction = metrics.bias_mw === null
    ? 'There is not enough matched data to assess directional bias.'
    : metrics.bias_mw > 0
      ? `The forecast overestimated generation by ${format(Math.abs(metrics.bias_mw))} MW on average.`
      : metrics.bias_mw < 0
        ? `The forecast underestimated generation by ${format(Math.abs(metrics.bias_mw))} MW on average.`
        : 'The forecast was directionally balanced on average.'

  return (
    <section className="border border-line bg-paper p-5 shadow-fine sm:p-7 lg:p-8">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="eyebrow">Accuracy analysis</p>
          <h2 className="mt-2 text-xl font-medium tracking-[-0.025em]">How far did the forecast miss?</h2>
        </div>
        <span className="hidden border border-line px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted sm:block">Lower is better</span>
      </div>

      <div className="mt-7 grid grid-cols-2 border-y border-line">
        <div className="border-r border-line py-5 pr-5">
          <p className="micro-label">MAE</p>
          <p className="metric-number mt-2 text-3xl">{format(metrics.mae_mw)} <span className="text-xs text-muted">MW</span></p>
          <p className="mt-2 text-xs leading-5 text-muted">The typical interval-level error, regardless of direction.</p>
        </div>
        <div className="py-5 pl-5">
          <p className="micro-label">RMSE</p>
          <p className="metric-number mt-2 text-3xl">{format(metrics.rmse_mw)} <span className="text-xs text-muted">MW</span></p>
          <p className="mt-2 text-xs leading-5 text-muted">A stricter score that gives larger misses more weight.</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3 border-l-2 border-bias pl-4">
        <div>
          <p className="text-xs font-semibold text-ink">Bias interpretation</p>
          <p className="mt-1 text-sm leading-6 text-muted">{direction}</p>
        </div>
      </div>
      {metrics.missing_intervals > 0 && <p className="mt-5 text-xs text-danger">{metrics.missing_intervals} unmatched interval(s) were excluded from these scores.</p>}
    </section>
  )
}
