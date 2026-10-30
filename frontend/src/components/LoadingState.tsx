export function LoadingState() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading Elexon wind data">
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="grid md:grid-cols-[200px_1fr_125px] lg:grid-cols-[220px_1fr_145px]">
          <div className="border-b border-line p-4 md:border-b-0 md:border-r"><div className="skeleton h-2.5 w-20" /><div className="skeleton mt-3 h-9 w-full rounded-md" /></div>
          <div className="grid gap-4 p-4 sm:grid-cols-3 sm:px-6"><div><div className="skeleton h-2.5 w-20" /><div className="skeleton mt-2 h-4 w-14" /></div><div><div className="skeleton h-2.5 w-20" /><div className="skeleton mt-2 h-4 w-14" /></div><div><div className="skeleton h-2.5 w-20" /><div className="skeleton mt-2 h-4 w-20" /></div></div>
          <div className="hidden border-l border-line p-4 md:block"><div className="skeleton h-2.5 w-20" /><div className="skeleton mt-2 h-4 w-16" /></div>
        </div>
      </div>
      <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-[2.3fr_2.75fr]">
        <div className="grid grid-cols-2 gap-px bg-line">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="bg-white p-4 sm:p-5"><div className="skeleton h-2.5 w-24" /><div className="skeleton mt-3 h-8 w-32" /><div className="skeleton mt-2 h-2.5 w-20" /></div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-px bg-line">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white p-3 sm:p-4"><div className="skeleton h-2.5 w-16" /><div className="skeleton mt-3 h-7 w-20" /><div className="skeleton mt-2 h-2.5 w-14" /></div>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-feature p-5">
        <div className="skeleton-dark h-4 w-56" />
        <div className="mt-10 flex h-64 items-end gap-2 sm:h-72">
          {[62, 69, 73, 66, 78, 74, 68, 80, 77, 70, 64, 58].map((height, index) => <div key={index} className="skeleton-dark flex-1 rounded-t-sm" style={{ height: `${height}%` }} />)}
        </div>
      </div>
    </div>
  )
}
