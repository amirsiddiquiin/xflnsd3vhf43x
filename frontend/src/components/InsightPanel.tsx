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
    <section className="insight-panel rounded-[22px] border border-warning/25 bg-warning-wash p-5 sm:p-6 lg:flex lg:items-center lg:justify-between lg:gap-10">
      <div className="max-w-xl">
        <p className="section-kicker text-warning-deep">Decision note</p>
        <h2 className="mt-1.5 text-base font-semibold tracking-[-0.02em] text-ink sm:text-lg">{headline}</h2>
      </div>
      <p className="mt-3 max-w-lg text-xs leading-5 text-muted lg:mt-0">{implication}</p>
    </section>
  )
}
