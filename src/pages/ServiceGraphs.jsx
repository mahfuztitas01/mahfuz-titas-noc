import { useMemo, useState } from 'react'
import Card from '../components/Card'
import ServiceChart from '../charts/ServiceChart'
import { serviceMetrics } from '../data/mockData'
import { classes } from '../utils/format'

const RANGES = ['1 Hour', '6 Hours', '24 Hours', '7 Days', '30 Days']
const POINTS = 48

function buildSeries(metric) {
  const data = []
  for (let i = POINTS - 1; i >= 0; i--) {
    const wave = Math.sin((i / POINTS) * Math.PI * 2) * 0.5 + 0.5
    const value = Number((metric.base + wave * metric.spread + (Math.random() - 0.5) * metric.spread * 0.3).toFixed(metric.unit === '%' ? 2 : 0))
    data.push({ time: `${i}`.padStart(2, '0'), value })
  }
  return data
}

export default function ServiceGraphs() {
  const [range, setRange] = useState('24 Hours')
  const [selected, setSelected] = useState(serviceMetrics[0].key)

  const seriesMap = useMemo(() => {
    const map = {}
    serviceMetrics.forEach((m) => { map[m.key] = buildSeries(m) })
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  const selectedMetric = serviceMetrics.find((m) => m.key === selected)

  return (
    <div className="space-y-6">
      <Card
        title="Service Graphs"
        subtitle="Network performance metrics"
        action={
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-noc-panel2">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={classes(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition',
                  range === r ? 'bg-white text-brand-600 shadow-sm dark:bg-noc-panel dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ServiceChart data={seriesMap[selected]} metric={selectedMetric} height={300} showLegend />
          </div>
          <div>
            <div className="noc-label">Metric</div>
            <div className="space-y-1">
              {serviceMetrics.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelected(m.key)}
                  className={classes(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition',
                    selected === m.key
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-noc-panel2'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.label}
                  </span>
                  <span className={classes('text-xs', selected === m.key ? 'text-white/80' : 'text-slate-400')}>{m.unit}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {serviceMetrics.map((m) => (
          <Card key={m.key} title={m.label} subtitle={m.unit ? `(${m.unit})` : 'sessions'}>
            <ServiceChart data={seriesMap[m.key]} metric={m} height={160} />
          </Card>
        ))}
      </div>
    </div>
  )
}
