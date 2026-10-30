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
    <div className="min-w-[220px] rounded-lg border border-white/10 bg-[#183840] p-3 text-white shadow-tooltip">
      <div className="flex items-center justify-between gap-5 border-b border-white/10 pb-2.5">
        <span className="text-[10px] font-medium text-chart-muted">Delivery interval</span>
        <span className="text-xs font-semibold tabular-nums">{label}</span>
      </div>
      <div className="space-y-2 pt-2.5">
        <div className="flex items-center justify-between gap-8 text-xs">
          <span className="flex items-center gap-2 text-chart-muted"><i className="h-2 w-2 rounded-full bg-chart-forecast" />Forecast</span>
          <strong className="tabular-nums">{point.forecast_mw === null ? '—' : `${mw.format(point.forecast_mw)} MW`}</strong>
        </div>
        <div className="flex items-center justify-between gap-8 text-xs">
          <span className="flex items-center gap-2 text-chart-muted"><i className="h-2 w-2 rounded-full bg-chart-actual" />Actual</span>
          <strong className="tabular-nums">{point.actual_mw === null ? '—' : `${mw.format(point.actual_mw)} MW`}</strong>
        </div>
        <div className="flex items-center justify-between gap-8 text-xs">
          <span className="text-chart-muted">Difference</span>
          <strong className="tabular-nums">{point.error_mw === null ? '—' : `${point.error_mw > 0 ? '+' : ''}${mw.format(point.error_mw)} MW`}</strong>
        </div>
      </div>
      <p className="mt-2.5 border-t border-white/10 pt-2.5 text-[10px] leading-4 text-chart-muted">{interpretation}</p>
      {point.is_interpolated && <p className="mt-1.5 text-[10px] text-chart-forecast">Forecast value linearly interpolated</p>}
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
    <div className="h-[320px] w-full sm:h-[380px] lg:h-[410px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 10, left: -8, bottom: 2 }}>
          <CartesianGrid stroke="#29464d" strokeOpacity={0.68} strokeDasharray="2 6" vertical={false} />
          <XAxis
            dataKey="label" interval="preserveStartEnd" minTickGap={42}
            tick={{ fill: '#9aadb1', fontSize: 10 }} axisLine={{ stroke: '#315158' }} tickLine={false} dy={9}
          />
          <YAxis
            width={60} domain={[0, 'auto']} tickCount={5}
            tickFormatter={(value: number) => value === 0 ? '0' : `${Math.round(value / 1000)}k`}
            tick={{ fill: '#9aadb1', fontSize: 10 }} axisLine={false} tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#718a90', strokeWidth: 1, strokeDasharray: '3 4' }} />
          <Line
            type="linear" dataKey="forecast_mw" name="Forecast" stroke="#2dd4bf" strokeWidth={2.2}
            dot={false} activeDot={{ r: 5, fill: '#2dd4bf', stroke: '#102a30', strokeWidth: 2.5 }}
            connectNulls={false} isAnimationActive={!reduceMotion} animationDuration={400}
          />
          <Line
            type="linear" dataKey="actual_mw" name="Actual" stroke="#8fa0ff" strokeWidth={2.2}
            dot={false} activeDot={{ r: 5, fill: '#8fa0ff', stroke: '#102a30', strokeWidth: 2.5 }}
            connectNulls={false} isAnimationActive={!reduceMotion} animationDuration={400}
          />
          <Line
            type="linear" dataKey="direct_forecast_mw" name="Published forecast point" stroke="transparent" strokeWidth={0}
            dot={{ r: 2.2, fill: '#102a30', stroke: '#2dd4bf', strokeWidth: 1.2 }} activeDot={false}
            connectNulls={false} isAnimationActive={false} legendType="none"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
