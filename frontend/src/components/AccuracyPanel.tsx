import type { Metrics } from '../types'

export function AccuracyPanel({ metrics }: { metrics: Metrics }) {
  const direction = metrics.bias_mw === null
    ? 'Not enough matched data to assess bias.'
    : metrics.bias_mw > 0
      ? 'Positive bias: the forecast systematically ran above actual generation.'
      : metrics.bias_mw < 0
        ? 'Negative bias: the forecast systematically ran below actual generation.'
        : 'Neutral bias: forecast errors balanced across the day.'

  return (
    <section className="py-1 lg:pr-6">
      <p className="section-kicker">Forecast accuracy</p>
      <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">How to read the error metrics</h2>

      <div className="mt-5 divide-y divide-line border-y border-line">
        <div className="grid gap-1 py-3 sm:grid-cols-[72px_1fr] sm:gap-4">
          <p className="text-xs font-semibold text-ink">MAE</p>
          <p className="text-xs leading-5 text-muted">The typical forecast miss, regardless of whether wind was over- or underestimated. Lower is better.</p>
        </div>
        <div className="grid gap-1 py-3 sm:grid-cols-[72px_1fr] sm:gap-4">
          <p className="text-xs font-semibold text-ink">RMSE</p>
          <p className="text-xs leading-5 text-muted">A stricter score that gives more weight to large interval errors. Lower is better.</p>
        </div>
        <div className="grid gap-1 py-3 sm:grid-cols-[72px_1fr] sm:gap-4">
          <p className="text-xs font-semibold text-ink">Bias</p>
          <p className="text-xs leading-5 text-muted">{direction}</p>
        </div>
      </div>
      {metrics.missing_intervals > 0 && <p className="mt-3 text-xs text-danger">{metrics.missing_intervals} unmatched interval(s) were excluded.</p>}
    </section>
  )
}
