import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

export default function DonutChart({ used = 72, available = 28, height = 220, centerLabel, centerValue }) {
  const data = [
    { name: 'Used', value: used, color: '#2563eb' },
    { name: 'Available', value: available, color: '#e2e8f0' },
  ]

  return (
    <div className="relative" style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="68%"
            outerRadius="92%"
            startAngle={90}
            endAngle={-270}
            stroke="none"
            paddingAngle={0}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">
          {centerValue ?? `${used}%`}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{centerLabel ?? 'Utilized'}</span>
      </div>
    </div>
  )
}
