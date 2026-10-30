import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { Interval } from '../types'

const time = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/London',
})
const mw = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })

interface ChartDatum extends Interval { label: string }

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload as ChartDatum | undefined
  if (!point) return null

  return (
    <div className="min-w-[210px] border border-line bg-paper p-3.5 shadow-tooltip">
      <div className="flex items-center justify-between gap-5 border-b border-line pb-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Delivery</span>
        <span className="text-xs font-semibold tabular-nums text-ink">{label}</span>
      </div>
      <div className="space-y-2.5 pt-3">
        <div className="flex items-center justify-between gap-6 text-xs">
          <span className="flex items-center gap-2 text-muted"><i className="h-2 w-2 rounded-full bg-forecast" />Forecast</span>
          <strong className="tabular-nums text-ink">{point.forecast_mw === null ? '—' : `${mw.format(point.forecast_mw)} MW`}</strong>
        </div>
        <div className="flex items-center justify-between gap-6 text-xs">
          <span className="flex items-center gap-2 text-muted"><i className="h-2 w-2 rounded-full bg-actual" />Actual</span>
          <strong className="tabular-nums text-ink">{point.actual_mw === null ? '—' : `${mw.format(point.actual_mw)} MW`}</strong>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[11px]">
        <span className="text-muted">Error</span>
        <strong className="tabular-nums text-ink">{point.error_mw === null ? '—' : `${point.error_mw > 0 ? '+' : ''}${mw.format(point.error_mw)} MW`}</strong>
      </div>
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
  const data: ChartDatum[] = intervals.map((item) => ({ ...item, label: time.format(new Date(item.start_time)) }))

  return (
    <div className="h-[340px] w-full sm:h-[430px] lg:h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 4 }}>
          <CartesianGrid stroke="#e6e3dc" strokeDasharray="2 5" vertical={false} />
          <XAxis
            dataKey="label"
            interval="preserveStartEnd"
            minTickGap={42}
            tick={{ fill: '#747872', fontSize: 11 }}
            axisLine={{ stroke: '#d9d5cc' }}
            tickLine={false}
            dy={10}
          />
          <YAxis
            width={60}
            domain={[0, 'auto']}
            tickFormatter={(value: number) => value === 0 ? '0' : `${Math.round(value / 1000)}k`}
            tick={{ fill: '#747872', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickCount={5}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#9a9d98', strokeWidth: 1, strokeDasharray: '3 4' }} />
          <Line
            type="monotone" dataKey="forecast_mw" name="Forecast" stroke="#16846f" strokeWidth={2.25}
            dot={false} activeDot={{ r: 4.5, fill: '#16846f', stroke: '#fffdfa', strokeWidth: 2 }}
            connectNulls={false} isAnimationActive={!reduceMotion} animationDuration={450}
          />
          <Line
            type="monotone" dataKey="actual_mw" name="Actual" stroke="#315fda" strokeWidth={2.25}
            dot={false} activeDot={{ r: 4.5, fill: '#315fda', stroke: '#fffdfa', strokeWidth: 2 }}
            connectNulls={false} isAnimationActive={!reduceMotion} animationDuration={450}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
