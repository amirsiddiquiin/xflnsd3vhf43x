interface DecisionRecordProps {
  methodology: string
  publications: string[]
  interpolated: number
}

export function DecisionRecord({ methodology, publications, interpolated }: DecisionRecordProps) {
  return (
    <section className="rounded-[22px] border border-line bg-white p-5 shadow-panel sm:p-6">
      <p className="section-kicker">Data treatment</p>
      <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">Selection and alignment</h2>

      <p className="mt-4 max-w-2xl text-xs leading-5 text-muted">{methodology}</p>

      <div className="mt-5 grid grid-cols-2 gap-x-6 rounded-2xl bg-canvas p-4">
        <div>
          <p className="field-label">Forecast vintage</p>
          <p className="mt-1 text-sm font-medium tabular-nums text-ink">{publications.length || '—'}</p>
          <p className="mt-0.5 text-[10px] text-muted">eligible publication{publications.length === 1 ? '' : 's'} used</p>
        </div>
        <div>
          <p className="field-label">Derived intervals</p>
          <p className="mt-1 text-sm font-medium tabular-nums text-ink">{interpolated}</p>
          <p className="mt-0.5 text-[10px] text-muted">linearly aligned half-hours</p>
        </div>
      </div>
    </section>
  )
}
