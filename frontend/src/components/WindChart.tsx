import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Interval } from '../types'

const time = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/London',
})

const mw = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })

export function WindChart({ intervals }: { intervals: Interval[] }) {
  const data = intervals.map((item) => ({
    ...item,
    label: time.format(new Date(item.start_time)),
  }))

  return (
    <div className="h-[360px] w-full sm:h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 10, left: 0, bottom: 4 }}>
          <CartesianGrid stroke="#e5ece9" strokeDasharray="4 6" vertical={false} />
          <XAxis
            dataKey="label"
            interval={5}
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            width={68}
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Generation (MW)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ border: '1px solid #dce7e3', borderRadius: 12, boxShadow: '0 10px 30px rgba(16,36,33,.1)' }}
            formatter={(value, name) => [`${mw.format(Number(value))} MW`, name]}
            labelFormatter={(label) => `${label} delivery interval`}
          />
          <Legend wrapperStyle={{ paddingTop: 18 }} />
          <Line
            type="monotone"
            dataKey="forecast_mw"
            name="Forecast"
            stroke="#18a889"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#18a889', stroke: 'white', strokeWidth: 2 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="actual_mw"
            name="Actual"
            stroke="#eb765a"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#eb765a', stroke: 'white', strokeWidth: 2 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
