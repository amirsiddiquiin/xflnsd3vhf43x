export function LoadingState() {
  return (
    <div className="py-7" role="status" aria-label="Loading Elexon wind data">
      <div className="mb-6 flex items-center gap-3 text-xs text-muted">
        <span className="loading-pulse h-2 w-2 rounded-full bg-forecast" />
        Selecting the latest eligible forecast…
      </div>
      <div className="overflow-hidden border border-line bg-paper">
        <div className="grid lg:grid-cols-3">
          <div className="border-b border-line p-7 lg:border-b-0 lg:border-r">
            <div className="skeleton h-3 w-36" /><div className="skeleton mt-6 h-12 w-48" /><div className="skeleton mt-5 h-3 w-56" />
          </div>
          <div className="border-b border-line p-7 lg:border-b-0 lg:border-r">
            <div className="skeleton h-3 w-32" /><div className="skeleton mt-6 h-12 w-44" /><div className="skeleton mt-5 h-3 w-52" />
          </div>
          <div className="p-7"><div className="skeleton h-3 w-28" /><div className="skeleton mt-5 h-8 w-32" /><div className="skeleton mt-8 h-3 w-24" /></div>
        </div>
      </div>
      <div className="mt-6 border border-line bg-paper p-7">
        <div className="skeleton h-4 w-52" />
        <div className="mt-12 flex h-72 items-end gap-2">
          {[45, 55, 62, 58, 68, 72, 65, 78, 74, 82, 69, 64].map((height, index) => <div key={index} className="skeleton flex-1" style={{ height: `${height}%` }} />)}
        </div>
      </div>
    </div>
  )
}
