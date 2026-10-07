import { useState } from 'react'
import { Users, UserCheck, UserX, ShieldAlert, RefreshCcw, Flame, Activity } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { useClient } from '../context/ClientContext'
import { statusToTone } from '../utils/format'

const STAT_CARDS = [
  { key: 'total', label: 'Total PPPoE Users', icon: Users, tone: 'info' },
  { key: 'active', label: 'Active Users', icon: UserCheck, tone: 'success' },
  { key: 'offline', label: 'Offline Users', icon: UserX, tone: 'muted' },
  { key: 'suspicious', label: 'Suspicious Activity', icon: ShieldAlert, tone: 'warning' },
  { key: 'flapping', label: 'Session Flapping', icon: Flame, tone: 'warning' },
  { key: 'highUsage', label: 'High Usage Users', icon: Activity, tone: 'critical' },
]

const TONE_RING = {
  info: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  critical: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  muted: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
}

export default function PPPWatchdog() {
  const { client, data } = useClient()
  const pppStats = data.pppStats
  const pppUsers = data.pppUsers
  const [showUsers, setShowUsers] = useState(false)

  const columns = [
    { key: 'username', header: 'Username', render: (r) => <span className="font-medium text-slate-800 dark:text-slate-100">{r.username}</span> },
    { key: 'ip', header: 'IP Address', render: (r) => <span className="font-mono text-xs">{r.ip}</span> },
    { key: 'mac', header: 'MAC Address', render: (r) => <span className="font-mono text-xs">{r.mac}</span> },
    { key: 'uptime', header: 'Uptime' },
    { key: 'download', header: 'Download', render: (r) => `${r.download} Mbps` },
    { key: 'upload', header: 'Upload', render: (r) => `${r.upload} Mbps` },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge tone={statusToTone(r.status)} label={r.status} /> },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.key} className="noc-card p-4">
              <div className={`mb-3 inline-flex rounded-lg p-2 ${TONE_RING[c.tone]}`}><Icon className="h-4 w-4" /></div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{pppStats[c.key]}</div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{c.label}</div>
            </div>
          )
        })}
      </div>

      <Card
        title="PPP Watchdog"
        subtitle="Session health, flapping and abuse detection"
        action={<Button icon={Users} onClick={() => setShowUsers(true)}>View PPP Users</Button>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400"><RefreshCcw className="h-4 w-4" /> Session Flapping</div>
            <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-300/80">{pppStats.flapping} sessions reconnected multiple times in the last hour.</p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400"><ShieldAlert className="h-4 w-4" /> Suspicious Activity</div>
            <p className="mt-1 text-xs text-red-600/80 dark:text-red-300/80">{pppStats.suspicious} users show abnormal login/usage patterns.</p>
          </div>
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-500/20 dark:bg-brand-500/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-400"><Activity className="h-4 w-4" /> High Usage</div>
            <p className="mt-1 text-xs text-brand-600/80 dark:text-brand-300/80">{pppStats.highUsage} users exceed normal bandwidth usage.</p>
          </div>
        </div>
      </Card>

      <Modal open={showUsers} onClose={() => setShowUsers(false)} title="PPP Users" size="lg">
        <DataTable columns={columns} data={pppUsers} rowKey={(r) => r.username} dense />
      </Modal>
    </div>
  )
}
