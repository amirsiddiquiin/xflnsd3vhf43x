import { dateLabel, dateTimeLabel, timeLabel } from '../format'
import { DatePicker } from './DatePicker'

interface DecisionContextProps {
  deliveryDate: string
  decisionCutoff: string
  publicationTime: string | null
  matchedIntervals: number
  selectedDate: string
  onDateChange: (value: string) => void
  refreshing?: boolean
}

export function DecisionContext({
  deliveryDate, decisionCutoff, publicationTime, matchedIntervals, selectedDate, onDateChange, refreshing = false,
}: DecisionContextProps) {
  return (
    <section className="decision-context relative z-20 rounded-[24px] border border-line bg-white p-4 shadow-panel sm:p-5" aria-label="Decision context">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-lg">
          <p className="section-kicker">Decision context</p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.025em] text-ink">What was known before delivery</h2>
          <p className="mt-1 text-xs leading-5 text-muted">The latest eligible forecast, the assumed buying cutoff, and the delivery window in one traceable sequence.</p>
        </div>
        <div className="w-full rounded-2xl bg-canvas p-3 lg:w-[270px]">
          <div className="flex items-center justify-between gap-3">
            <p className="field-label">Delivery date</p>
            <span className="text-[10px] font-medium text-muted">Jan decision window</span>
          </div>
          <DatePicker value={selectedDate} onChange={onDateChange} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="timeline-card timeline-published">
          <span className="timeline-index">01</span>
          <p className="field-label">Forecast published</p>
          <p className="mt-2 text-base font-semibold tabular-nums text-ink">{publicationTime ? timeLabel.format(new Date(publicationTime)) : 'Unavailable'}</p>
          <p className="mt-0.5 text-[11px] text-muted">{publicationTime ? dateLabel.format(new Date(publicationTime)) : 'No eligible vintage'}</p>
        </div>
        <div className="timeline-card timeline-decision">
          <span className="timeline-index">02</span>
          <p className="field-label">Purchase cutoff</p>
          <p className="mt-2 text-base font-semibold tabular-nums text-ink">{timeLabel.format(new Date(decisionCutoff))}</p>
          <p className="mt-0.5 text-[11px] text-muted">Assumed · {dateTimeLabel.format(new Date(decisionCutoff)).split(',')[0]}</p>
        </div>
        <div className="timeline-card timeline-delivery">
          <span className="timeline-index">03</span>
          <p className="field-label">Electricity delivery</p>
          <p className="mt-2 text-base font-semibold text-ink">{dateLabel.format(new Date(`${deliveryDate}T12:00:00Z`))}</p>
          <p className="mt-0.5 text-[11px] text-muted">48 half-hour periods</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[11px]">
        <span className="text-muted">Decision window: 1–31 January 2026</span>
        <span className="flex items-center gap-2 font-semibold text-ink">
          {refreshing && <i className="refresh-dot" aria-hidden="true" />}
          {refreshing ? 'Updating data' : 'Aligned intervals'}
          <span className="rounded-full bg-success-wash px-2 py-0.5 font-mono text-[10px] text-success">{matchedIntervals} / 48</span>
        </span>
      </div>
    </section>
  )
}
