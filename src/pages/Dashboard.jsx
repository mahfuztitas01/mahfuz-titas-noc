import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Network, Activity, AlertTriangle, Users, ArrowUpRight,
  Wifi, Server, Router, Camera, Antenna, Cable, Globe, Cloud, Youtube, Play, Radio,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import Card from '../components/Card'
import Button from '../components/Button'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import VendorBadge from '../components/VendorBadge'
import DeviceIcon from '../components/DeviceIcon'
import TrafficChart from '../charts/TrafficChart'
import DonutChart from '../charts/DonutChart'
import { useLive, useLiveDevices } from '../hooks/useLiveData'
import { useAlertEngine } from '../hooks/useAlertEngine'
import { usePingStatus } from '../hooks/usePingStatus'
import { useClient } from '../context/ClientContext'
import { useToast } from '../components/Toast'
import { generateTraffic } from '../data/mockData'
import { getCategoryIcon, getVendor } from '../data/vendors'
import { classes, severityToTone, statusToTone } from '../utils/format'

const RANGES = ['1H', '6H', '24H', '7D', '30D']
const DEST_ICONS = { Google: Globe, Facebook: Users, YouTube: Youtube, Netflix: Play, Cloudflare: Cloud }

export default function Dashboard() {
  const { client, data } = useClient()
  const live = useLive(
    3000,
    { bandwidth: data.linkUtilization.current, pppoeActive: data.kpis.pppoe.active, latency: data.destinations[0].latency, cpu: data.devices[0].cpu },
    client.id
  )
  const deviceList = useLiveDevices(data.devices, 4000)
  const { status: pingStatus, reachable: pingReachable } = usePingStatus(deviceList)
  const onlineCount = deviceList.filter((d) => (pingStatus[d.id] || d.status) === 'online').length
  const clientMeta = useMemo(
    () => ({ id: client.id, name: client.name, short: client.short, whatsapp: client.whatsapp }),
    [client]
  )
  const { alerts, setStatus } = useAlertEngine(live, data.alerts, client.id, clientMeta)
  const { push } = useToast()
  const [range, setRange] = useState('24H')

  const traffic = useMemo(() => generateTraffic(range), [range])

  const prevCount = useRef(alerts.length)
  useEffect(() => {
    if (alerts.length > prevCount.current) {
      const a = alerts[0]
      push(`New alert: ${a.title} — ${a.device}`, a.severity === 'critical' ? 'error' : 'warning')
    }
    prevCount.current = alerts.length
  }, [alerts, push])

  const openAlerts = alerts.filter((a) => a.status !== 'resolved')
  const lu = data.linkUtilization

  return (
    <div className="space-y-6">
      {/* Active client banner */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-noc-border dark:bg-noc-panel">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Monitoring</span>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">{client.name}</span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-noc-panel2 dark:text-slate-400">{client.short} · {client.region} · {client.plan}</span>
        <StatusBadge tone={statusToTone(client.status)} label={client.status} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Network} tone={onlineCount > 0 ? 'success' : 'critical'} label="Online Devices" value={onlineCount} sub={`${data.devices.length} total · ${pingReachable ? 'live ping' : 'backend offline'}`} />
        <StatCard icon={Activity} tone="success" label="Total Bandwidth" value={Math.round(live.bandwidth)} unit="Mbps" sub="Current Traffic" />
        <StatCard icon={AlertTriangle} tone={openAlerts.length ? 'warning' : 'success'} label="Active Alerts" value={openAlerts.length} sub="Auto-generated from thresholds" />
        <StatCard icon={Users} tone="info" label="Active PPPoE Users" value={`${live.pppoeActive} / ${data.pppoe?.total ?? data.kpis.pppoe.total}`} sub="Active Users" />
      </div>

      {/* Traffic + Link utilization */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title={`Network Traffic — ${client.short}`}
          subtitle="Download vs Upload (Mbps)"
          action={
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-noc-panel2">
              {RANGES.map((r) => (
                <button key={r} onClick={() => setRange(r)} className={classes('rounded-md px-2.5 py-1 text-xs font-medium transition', range === r ? 'bg-white text-brand-600 shadow-sm dark:bg-noc-panel dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400')}>
                  {r}
                </button>
              ))}
            </div>
          }
        >
          <TrafficChart data={traffic} height={300} />
        </Card>

        <Card title="Link Utilization" subtitle={`${client.short} aggregate`}>
          <DonutChart used={lu.used} available={lu.available} height={200} centerValue={`${lu.used}%`} centerLabel="Utilized" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-noc-panel2">
              <div className="text-xs text-slate-500 dark:text-slate-400">Current</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{lu.current} <span className="text-xs font-medium text-slate-400">Mbps</span></div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-noc-panel2">
              <div className="text-xs text-slate-500 dark:text-slate-400">Capacity</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{lu.capacity} <span className="text-xs font-medium text-slate-400">Mbps</span></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Destinations + Network health */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Top Destinations" subtitle={`${client.short} traffic share`}>
          <ul className="space-y-4">
            {data.topDestinations.map((d) => {
              const Icon = DEST_ICONS[d.name] || Globe
              return (
                <li key={d.name}>
                  <div className="mb-1.5 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><Icon className="h-4 w-4" /></span>
                    <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{d.name}</span>
                    <StatusBadge tone={statusToTone(d.status)} label={d.status === 'online' ? 'Online' : 'Degraded'} />
                    <span className="w-10 text-right text-sm font-semibold text-slate-900 dark:text-white">{d.pct}%</span>
                  </div>
                  <ProgressBar value={d.pct} tone={d.status === 'online' ? 'info' : 'warning'} />
                </li>
              )
            })}
          </ul>
        </Card>

        <Card title="Network Health" subtitle={`${client.short} live device status`}>
          <ul className="divide-y divide-slate-100 dark:divide-noc-border/60">
            {deviceList.map((d) => {
              const Icon = getCategoryIcon(d.category || d.type)
              const st = pingStatus[d.id] || d.status
              return (
                <li key={d.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <DeviceIcon category={d.category} status={st} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{d.name}</span>
                      <StatusBadge tone={statusToTone(st)} label={st} />
                    </div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">{getVendor(d.vendor).name} {d.category || d.type} · {d.ip}</div>
                  </div>
                  <div className="hidden w-32 sm:block">
                    <div className="mb-1 flex justify-between text-[10px] text-slate-400"><span>CPU</span><span>{d.cpu}%</span></div>
                    <ProgressBar value={d.cpu} tone={d.cpu > 85 ? 'critical' : d.cpu > 65 ? 'warning' : 'success'} height="h-1.5" />
                    <div className="mb-1 mt-1.5 flex justify-between text-[10px] text-slate-400"><span>MEM</span><span>{d.memory}%</span></div>
                    <ProgressBar value={d.memory} tone={d.memory > 85 ? 'critical' : d.memory > 65 ? 'warning' : 'success'} height="h-1.5" />
                  </div>
                  <div className="hidden w-20 text-right text-xs text-slate-500 dark:text-slate-400 md:block">
                    <div className="font-medium text-slate-700 dark:text-slate-200">{d.uptime}</div>
                    <div>uptime</div>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      {/* Active alerts */}
      <Card
        title="Active Alerts"
        subtitle={`${client.short} · ${openAlerts.length} open / acknowledged`}
        action={<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"><Radio className="h-3.5 w-3.5 animate-pulse" /> Live · auto-generating</span>}
      >
        <ul className="space-y-3">
          {alerts.map((a) => (
            <li key={a.id} className={classes('flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center', a.fresh ? 'border-brand-300 bg-brand-50/50 dark:border-brand-500/40 dark:bg-brand-500/5' : 'border-slate-200 dark:border-noc-border')}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge tone={severityToTone(a.severity)} label={a.severity} />
                  {a.fresh && <StatusBadge tone="info" label="new" />}
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.title}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">{a.device}</span> · {a.time} · {a.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge tone={a.status === 'open' ? 'warning' : a.status === 'acknowledged' ? 'info' : 'success'} label={a.status} />
                {a.status === 'open' && <Button size="sm" variant="outline" onClick={() => setStatus(a.id, 'acknowledged')}>Acknowledge</Button>}
                {a.status !== 'resolved' && <Button size="sm" variant="secondary" onClick={() => setStatus(a.id, 'resolved')}>Resolve</Button>}
                <Button size="sm" variant="ghost" icon={ArrowUpRight}>Details</Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
