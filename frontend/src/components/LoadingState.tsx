export function LoadingState() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading Elexon wind data">
      <div className="rounded-[24px] border border-line bg-white p-5 shadow-panel">
        <div className="flex flex-col justify-between gap-5 lg:flex-row">
          <div><div className="skeleton h-2.5 w-24" /><div className="skeleton mt-3 h-6 w-64" /><div className="skeleton mt-2 h-3 w-80 max-w-full" /></div>
          <div className="skeleton h-16 w-full rounded-2xl lg:w-[270px]" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="rounded-2xl border border-line p-4"><div className="skeleton h-2.5 w-24" /><div className="skeleton mt-3 h-5 w-28" /><div className="skeleton mt-2 h-2.5 w-20" /></div>)}</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-[20px] border border-line bg-white p-5"><div className="skeleton h-2.5 w-20" /><div className="skeleton mt-3 h-8 w-28" /><div className="skeleton mt-3 h-2.5 w-24" /></div>
        ))}
      </div>
      <div className="overflow-hidden rounded-[24px] border border-line bg-white p-5 shadow-panel">
        <div className="skeleton h-4 w-56" />
        <div className="mt-10 flex h-64 items-end gap-2 sm:h-72">
          {[62, 69, 73, 66, 78, 74, 68, 80, 77, 70, 64, 58].map((height, index) => <div key={index} className="skeleton flex-1 rounded-t-sm" style={{ height: `${height}%` }} />)}
        </div>
      </div>
    </div>
  )
}
