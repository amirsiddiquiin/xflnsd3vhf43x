import { dateTimeLabel } from '../format'

interface DecisionRecordProps {
  decisionCutoff: string
  methodology: string
  publications: string[]
  interpolated: number
}

export function DecisionRecord({ decisionCutoff, methodology, publications, interpolated }: DecisionRecordProps) {
  const publicationText = publications.length === 0
    ? 'No eligible forecast'
    : publications.length === 1
      ? dateTimeLabel.format(new Date(publications[0]))
      : `${dateTimeLabel.format(new Date(publications[0]))} – ${dateTimeLabel.format(new Date(publications.at(-1)!))}`

  return (
    <section className="border border-line bg-paper p-5 shadow-fine sm:p-7 lg:p-8">
      <p className="eyebrow">Decision record</p>
      <h2 className="mt-2 text-xl font-medium tracking-[-0.025em]">What was available at purchase time</h2>

      <dl className="mt-7 divide-y divide-line border-y border-line">
        <div className="grid grid-cols-[.8fr_1.2fr] gap-5 py-4">
          <dt className="micro-label self-center">Decision cutoff</dt>
          <dd className="text-right text-sm font-medium tabular-nums text-ink">{dateTimeLabel.format(new Date(decisionCutoff))}</dd>
        </div>
        <div className="grid grid-cols-[.8fr_1.2fr] gap-5 py-4">
          <dt className="micro-label self-center">Forecast published</dt>
          <dd className="text-right text-sm font-medium tabular-nums text-ink">{publicationText}</dd>
        </div>
        <div className="grid grid-cols-[.8fr_1.2fr] gap-5 py-4">
          <dt className="micro-label self-center">Interval treatment</dt>
          <dd className="text-right text-sm font-medium text-ink">{interpolated} half-hours interpolated</dd>
        </div>
      </dl>

      <div className="mt-6">
        <p className="micro-label">Selection method</p>
        <p className="mt-2 text-xs leading-5 text-muted">{methodology}</p>
      </div>
    </section>
  )
}
