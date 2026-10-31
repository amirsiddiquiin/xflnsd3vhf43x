import type { Metrics } from '../types'

const format = (value: number) => Math.round(Math.abs(value)).toLocaleString('en-GB')

export function InsightPanel({ metrics }: { metrics: Metrics }) {
  if (metrics.bias_mw === null) return null
  const direction = metrics.bias_mw > 0 ? 'over' : metrics.bias_mw < 0 ? 'under' : 'balanced'
  const headline = direction === 'over'
    ? `Wind generation was overestimated by ${format(metrics.bias_mw)} MW on average.`
    : direction === 'under'
      ? `Wind generation was underestimated by ${format(metrics.bias_mw)} MW on average.`
      : 'Wind generation was accurately balanced on average.'
  const implication = direction === 'over'
    ? 'An overestimated wind forecast increases the risk that less renewable generation is available than the purchasing plan anticipated.'
    : direction === 'under'
      ? 'An underestimated wind forecast means more wind generation was available than the purchasing plan anticipated.'
      : 'The signed errors offset across the day, although individual intervals may still contain forecast misses.'

  return (
    <section className="insight-panel border-l-2 border-warning px-4 py-2 sm:px-5 lg:flex lg:items-start lg:justify-between lg:gap-10">
      <div>
        <p className="section-kicker text-warning-deep">Forecast observation</p>
        <h2 className="mt-1 text-sm font-semibold tracking-[-0.01em] text-ink sm:text-base">{headline}</h2>
      </div>
      <p className="mt-2 max-w-xl text-xs leading-5 text-muted lg:mt-0">{implication}</p>
    </section>
  )
}
