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
    <section className="decision-context overflow-hidden rounded-[14px] border border-line/80 bg-white" aria-label="Decision context">
      <div className="grid md:grid-cols-[200px_1fr_auto] md:items-stretch lg:grid-cols-[220px_1fr_auto]">
        <div className="border-b border-line px-4 py-4 sm:px-5 md:border-b-0 md:border-r">
          <p className="field-label">Delivery date</p>
          <DatePicker value={selectedDate} onChange={onDateChange} />
          <p className="mt-1.5 text-[10px] text-muted">Decision window: 1–31 January</p>
        </div>

        <div className="px-4 py-4 sm:px-6 md:flex md:items-center">
          <div className="grid w-full gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-start">
            <div className="timeline-point timeline-published">
              <p className="field-label">Forecast published</p>
              <p className="mt-1 text-sm font-medium tabular-nums text-ink">{publicationTime ? timeLabel.format(new Date(publicationTime)) : 'Unavailable'}</p>
              <p className="mt-0.5 text-[10px] text-muted">{publicationTime ? dateLabel.format(new Date(publicationTime)) : 'No eligible vintage'}</p>
            </div>
            <div className="timeline-connector" />
            <div className="timeline-point timeline-decision">
              <p className="field-label">Purchase cutoff</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-ink">{timeLabel.format(new Date(decisionCutoff))}</p>
              <p className="mt-0.5 text-[10px] text-muted">Assumed · {dateTimeLabel.format(new Date(decisionCutoff)).split(',')[0]}</p>
            </div>
            <div className="timeline-connector" />
            <div className="timeline-point timeline-delivery">
              <p className="field-label">Electricity delivery</p>
              <p className="mt-1 text-sm font-medium text-ink">{dateLabel.format(new Date(`${deliveryDate}T12:00:00Z`))}</p>
              <p className="mt-0.5 text-[10px] text-muted">48 half-hour periods</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 md:w-[125px] md:flex-col md:justify-center md:border-l md:border-t-0 lg:w-[145px]">
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
            {refreshing && <i className="refresh-dot" aria-hidden="true" />}
            {refreshing ? 'Updating' : 'Data alignment'}
          </span>
          <p className="text-sm font-semibold tabular-nums text-ink">{matchedIntervals}<span className="font-normal text-muted"> / 48</span></p>
        </div>
      </div>
    </section>
  )
}
