import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipProps } from 'recharts'
import type { Interval } from '../types'

const time = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/London',
})
const mw = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })

interface ChartDatum extends Interval {
  label: string
  direct_forecast_mw: number | null
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload as ChartDatum | undefined
  if (!point) return null
  const interpretation = point.error_mw === null
    ? 'No matched interval'
    : point.error_mw > 0
      ? 'Forecast overestimated generation'
      : point.error_mw < 0
        ? 'Forecast underestimated generation'
        : 'Forecast matched actual generation'

  return (
    <div className="chart-tooltip min-w-[220px] rounded-xl border border-line bg-white p-3.5 text-ink shadow-tooltip">
      <div className="flex items-center justify-between gap-5 border-b border-line pb-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Delivery interval</span>
        <span className="font-mono text-xs font-semibold tabular-nums">{label}</span>
      </div>
      <div className="space-y-2 pt-2.5">
        <div className="flex items-center justify-between gap-8 text-xs">
          <span className="flex items-center gap-2 text-muted"><i className="h-2 w-2 rounded-full bg-chart-forecast" />Forecast</span>
          <strong className="font-mono tabular-nums">{point.forecast_mw === null ? '—' : `${mw.format(point.forecast_mw)} MW`}</strong>
        </div>
        <div className="flex items-center justify-between gap-8 text-xs">
          <span className="flex items-center gap-2 text-muted"><i className="h-2 w-2 rounded-full bg-chart-actual" />Actual</span>
          <strong className="font-mono tabular-nums">{point.actual_mw === null ? '—' : `${mw.format(point.actual_mw)} MW`}</strong>
        </div>
        <div className="flex items-center justify-between gap-8 text-xs">
          <span className="text-muted">Difference</span>
          <strong className="font-mono tabular-nums">{point.error_mw === null ? '—' : `${point.error_mw > 0 ? '+' : ''}${mw.format(point.error_mw)} MW`}</strong>
        </div>
      </div>
      <p className="mt-2.5 border-t border-line pt-2.5 text-[10px] leading-4 text-muted">{interpretation}</p>
      {point.is_interpolated && <p className="mt-1.5 text-[10px] font-semibold text-forecast">Forecast value linearly interpolated</p>}
    </div>
  )
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

export function WindChart({ intervals }: { intervals: Interval[] }) {
  const reduceMotion = useReducedMotion()
  const data: ChartDatum[] = intervals.map((item) => ({
    ...item,
    label: time.format(new Date(item.start_time)),
    direct_forecast_mw: item.is_interpolated ? null : item.forecast_mw,
  }))

  return (
    <div className="h-[300px] w-full sm:h-[345px] lg:h-[370px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 10, left: -8, bottom: 2 }}>
          <CartesianGrid stroke="#e4e8e3" strokeOpacity={0.9} strokeDasharray="2 7" vertical={false} />
          <XAxis
            dataKey="label" interval="preserveStartEnd" minTickGap={42}
            tick={{ fill: '#7b847e', fontSize: 10 }} axisLine={{ stroke: '#dfe4de' }} tickLine={false} dy={9}
          />
          <YAxis
            width={60} domain={[0, 'auto']} tickCount={5}
            tickFormatter={(value: number) => value === 0 ? '0' : `${Math.round(value / 1000)}k`}
            tick={{ fill: '#7b847e', fontSize: 10 }} axisLine={false} tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#9ba49d', strokeWidth: 1, strokeDasharray: '3 4' }} />
          <Line
            type="linear" dataKey="forecast_mw" name="Forecast" stroke="#14806f" strokeWidth={2.4}
            dot={false} activeDot={{ r: 5, fill: '#14806f', stroke: '#ffffff', strokeWidth: 2.5 }}
            connectNulls={false} isAnimationActive={!reduceMotion} animationDuration={260} animationEasing="ease-out"
          />
          <Line
            type="linear" dataKey="actual_mw" name="Actual" stroke="#6d70e6" strokeWidth={2.4}
            dot={false} activeDot={{ r: 5, fill: '#6d70e6', stroke: '#ffffff', strokeWidth: 2.5 }}
            connectNulls={false} isAnimationActive={!reduceMotion} animationDuration={260} animationEasing="ease-out"
          />
          <Line
            type="linear" dataKey="direct_forecast_mw" name="Published forecast point" stroke="transparent" strokeWidth={0}
            dot={{ r: 2.2, fill: '#ffffff', stroke: '#14806f', strokeWidth: 1.4 }} activeDot={false}
            connectNulls={false} isAnimationActive={false} legendType="none"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
