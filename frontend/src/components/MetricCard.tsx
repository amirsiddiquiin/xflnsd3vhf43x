interface MetricCardProps {
  label: string
  value: number | null
  accent: 'teal' | 'coral' | 'slate'
  helper: string
}

const accentClasses = {
  teal: 'bg-teal-500',
  coral: 'bg-coral',
  slate: 'bg-slate-400',
}

const formatMw = (value: number | null) =>
  value === null
    ? '—'
    : new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(value)

export function MetricCard({ label, value, accent, helper }: MetricCardProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
      <div className={`absolute inset-x-0 top-0 h-1 ${accentClasses[accent]}`} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-3xl font-semibold tracking-tight text-ink">{formatMw(value)}</span>
        <span className="mb-1 text-sm font-medium text-slate-400">MW</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{helper}</p>
    </article>
  )
}
