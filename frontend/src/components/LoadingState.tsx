export function LoadingState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-500" />
      <p className="mt-4 text-sm font-medium text-slate-600">Loading Elexon data…</p>
      <p className="mt-1 text-xs text-slate-400">Selecting the latest eligible forecasts</p>
    </div>
  )
}
