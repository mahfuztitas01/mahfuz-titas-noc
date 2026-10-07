import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

export default function ServiceChart({ data, metric, height = 240, showLegend = false }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={30} />
          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={44} />
          <Tooltip
            formatter={(v) => [`${v}${metric.unit ? ' ' + metric.unit : ''}`, metric.label]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
          <Line
            type="monotone"
            dataKey="value"
            name={metric.label}
            stroke={metric.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
