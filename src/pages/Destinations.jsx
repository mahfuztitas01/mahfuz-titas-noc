import { Globe2, RefreshCw } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import { useClient } from '../context/ClientContext'
import { useToast } from '../components/Toast'
import { statusToTone } from '../utils/format'

export default function Destinations() {
  const { push } = useToast()
  const { client, data } = useClient()
  const destinations = data.destinations

  const columns = [
    { key: 'name', header: 'Destination', render: (r) => (
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Globe2 className="h-4 w-4" />
        </span>
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-100">{r.name}</div>
          <div className="font-mono text-xs text-slate-500 dark:text-slate-400">{r.host}</div>
        </div>
      </div>
    ) },
    { key: 'latency', header: 'Latency', render: (r) => `${r.latency} ms` },
    { key: 'loss', header: 'Packet Loss', render: (r) => `${r.loss}%` },
    { key: 'availability', header: 'Availability', render: (r) => `${r.availability}%` },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge tone={statusToTone(r.status)} label={r.status} /> },
    { key: 'lastCheck', header: 'Last Check', align: 'right' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {destinations.map((d) => (
          <Card key={d.name}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{d.name}</h3>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{d.host}</p>
              </div>
              <StatusBadge tone={statusToTone(d.status)} label={d.status} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-noc-panel2">
                <div className="text-lg font-bold text-slate-900 dark:text-white">{d.latency}</div>
                <div className="text-[10px] uppercase text-slate-400">ms</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-noc-panel2">
                <div className="text-lg font-bold text-slate-900 dark:text-white">{d.loss}%</div>
                <div className="text-[10px] uppercase text-slate-400">loss</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-noc-panel2">
                <div className="text-lg font-bold text-slate-900 dark:text-white">{d.availability}%</div>
                <div className="text-[10px] uppercase text-slate-400">avail</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card
        title={`Destination Monitoring — ${client.short}`}
        subtitle="Latency, loss and availability per destination"
        action={<Button size="sm" variant="outline" icon={RefreshCw} onClick={() => push('Refreshed destination checks', 'success')}>Refresh</Button>}
      >
        <DataTable columns={columns} data={destinations} rowKey={(r) => r.host} />
      </Card>
    </div>
  )
}
