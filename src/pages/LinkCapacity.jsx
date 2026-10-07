import { Gauge, ArrowDownToLine, ArrowUpFromLine, Activity, ShieldCheck } from 'lucide-react'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'
import StatusBadge from '../components/StatusBadge'
import { useClient } from '../context/ClientContext'
import { statusToTone } from '../utils/format'

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-noc-panel2">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={`mt-1 text-lg font-bold ${tone || 'text-slate-900 dark:text-white'}`}>{value}</div>
    </div>
  )
}

export default function LinkCapacity() {
  const { client, data } = useClient()
  const links = data.links
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-noc-border dark:bg-noc-panel">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Link capacity for</span>{' '}
        <span className="font-semibold text-slate-900 dark:text-white">{client.name}</span>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {links.map((l) => {
          const utilTone = l.utilization > 85 ? 'critical' : l.utilization > 65 ? 'warning' : 'success'
          return (
            <Card key={l.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{l.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {l.id === 'primary' ? 'Primary uplink' : 'Failover uplink'}
                  </p>
                </div>
                <StatusBadge tone={statusToTone(l.status)} label={l.status} />
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Utilization</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{l.utilization}%</span>
                </div>
                <ProgressBar value={l.utilization} tone={utilTone} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Metric icon={Gauge} label="Capacity" value={`${l.capacity} Mbps`} />
                <Metric icon={ArrowDownToLine} label="Current" value={`${l.current} Mbps`} />
                <Metric icon={ArrowUpFromLine} label="Peak" value={`${l.peak} Mbps`} />
                <Metric icon={ShieldCheck} label="Availability" value={`${l.availability}%`} />
                <Metric icon={Activity} label="Latency" value={`${l.latency} ms`} />
                <Metric icon={Activity} label="Packet Loss" value={`${l.loss}%`} tone={l.loss > 0.5 ? 'text-amber-500' : undefined} />
              </div>
            </Card>
          )
        })}
      </div>

      <Card title="Aggregate Capacity" subtitle="Combined utilization across all links">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Metric icon={Gauge} label="Total Capacity" value={`${links.reduce((s, l) => s + l.capacity, 0)} Mbps`} />
          <Metric icon={ArrowDownToLine} label="Total Current" value={`${links.reduce((s, l) => s + l.current, 0)} Mbps`} />
          <Metric
            icon={Activity}
            label="Combined Utilization"
            value={`${Math.round((links.reduce((s, l) => s + l.current, 0) / links.reduce((s, l) => s + l.capacity, 0)) * 100)}%`}
          />
        </div>
      </Card>
    </div>
  )
}
