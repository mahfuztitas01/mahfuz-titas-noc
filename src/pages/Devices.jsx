import { useState } from 'react'
import { Plus, Pencil, Trash2, Eye, Server } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import VendorBadge from '../components/VendorBadge'
import DeviceIcon from '../components/DeviceIcon'
import { useClient } from '../context/ClientContext'
import { useToast } from '../components/Toast'
import { usePingStatus } from '../hooks/usePingStatus'
import { CATEGORIES, VENDORS, getVendor } from '../data/vendors'
import { getModel, getModelsForVendor } from '../data/deviceModels'
import { statusToTone } from '../utils/format'

const emptyForm = { name: '', ip: '', category: 'Router', vendor: 'mikrotik', model: 'rb4011', status: 'online', cpu: 0, memory: 0 }

export default function Devices() {
  const { push } = useToast()
  const { client, data, saveDevices } = useClient()
  const list = data.devices
  const { status: liveStatus, reachable, checking } = usePingStatus(list)
  const [modal, setModal] = useState(null) // {mode:'add'|'edit'}
  const [form, setForm] = useState(emptyForm)
  const [details, setDetails] = useState(null)

  const openAdd = () => { setForm(emptyForm); setModal({ mode: 'add' }) }
  const openEdit = (row) => { setForm({ ...row }); setModal({ mode: 'edit' }) }

  const buildDevice = () => ({
    name: form.name,
    ip: form.ip,
    category: form.category,
    vendor: form.vendor,
    model: form.model,
    type: `${getVendor(form.vendor).name} ${form.category}`,
  })

  const save = () => {
    if (!form.name || !form.ip) {
      push('Device name and IP are required', 'error')
      return
    }
    if (modal.mode === 'add') {
      saveDevices(client.id, [
        ...list,
        { ...buildDevice(), id: Date.now(), status: form.status, cpu: Number(form.cpu), memory: Number(form.memory), uptime: '0h', lastSeen: 'Just now' },
      ])
      push(`Device ${form.name} added`, 'success')
    } else {
      saveDevices(
        client.id,
        list.map((d) => (d.id === form.id ? { ...d, ...buildDevice(), status: form.status, cpu: Number(form.cpu), memory: Number(form.memory) } : d))
      )
      push(`Device ${form.name} updated`, 'success')
    }
    setModal(null)
  }

  const remove = (row) => {
    saveDevices(client.id, list.filter((d) => d.id !== row.id))
    push(`Device ${row.name} deleted`, 'warning')
  }

  const columns = [
    { key: 'name', header: 'Device', render: (r) => {
      const st = liveStatus[r.id] || r.status
      return (
        <div className="flex items-center gap-2.5">
          <DeviceIcon category={r.category} status={st} size={34} />
          <span className="font-medium text-slate-800 dark:text-slate-100">{r.name}</span>
        </div>
      )
    } },
    { key: 'ip', header: 'IP Address', render: (r) => <span className="font-mono text-xs">{r.ip}</span> },
    { key: 'type', header: 'Type / Vendor', render: (r) => (
      <span className="flex items-center gap-2 text-xs">
        <VendorBadge vendor={r.vendor} size={20} />
        <span className="font-medium text-slate-700 dark:text-slate-200">{r.category || r.type}</span>
        <span className="text-slate-400">{getVendor(r.vendor).name}</span>
      </span>
    ) },
    { key: 'status', header: 'Status', render: (r) => { const st = liveStatus[r.id] || r.status; return <StatusBadge tone={statusToTone(st)} label={st} /> } },
    { key: 'cpu', header: 'CPU', render: (r) => (
      <div className="w-24"><div className="mb-1 text-xs text-slate-500">{r.cpu}%</div><ProgressBar value={r.cpu} tone={r.cpu > 85 ? 'critical' : r.cpu > 65 ? 'warning' : 'success'} height="h-1.5" /></div>
    ) },
    { key: 'memory', header: 'Memory', render: (r) => `${r.memory}%` },
    { key: 'uptime', header: 'Uptime' },
    { key: 'actions', header: 'Actions', align: 'right', render: (r) => (
      <div className="flex items-center justify-end gap-1">
        <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-noc-panel2" onClick={() => setDetails(r)} title="View"><Eye className="h-4 w-4" /></button>
        <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-noc-panel2" onClick={() => openEdit(r)} title="Edit"><Pencil className="h-4 w-4" /></button>
        <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-noc-panel2" onClick={() => remove(r)} title="Delete"><Trash2 className="h-4 w-4" /></button>
      </div>
    ) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button icon={Plus} onClick={openAdd}>Add Device</Button>
      </div>

      <Card
        title={`Local Devices — ${client.short}`}
        subtitle={`${list.length} devices · ${reachable ? 'live ping from your PC' : 'backend offline — showing last known'}`}
        action={
          <span className={'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ' + (reachable ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400')}>
            <span className={'h-2 w-2 rounded-full ' + (checking ? 'bg-amber-500 animate-pulse' : reachable ? 'bg-emerald-500' : 'bg-red-500')} />
            {checking ? 'Pinging…' : reachable ? 'Live' : 'Offline'}
          </span>
        }
      >
        <DataTable columns={columns} data={list} rowKey={(r) => r.id} />
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit Device' : 'Add Device'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save}>{modal?.mode === 'edit' ? 'Save Changes' : 'Add Device'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="noc-label">Device Name</label>
            <input className="noc-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="CORE-RT-2" />
          </div>
          <div>
            <label className="noc-label">IP Address</label>
            <input className="noc-input" value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} placeholder="172.17.55.5" />
          </div>
          <div>
            <label className="noc-label">Device Category</label>
            <select className="noc-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="noc-label">Vendor</label>
            <select className="noc-input" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value, model: getModelsForVendor(e.target.value)[0]?.id || '' })}>
              {VENDORS.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="noc-label">Model</label>
            <select className="noc-input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}>
              <option value="">— none —</option>
              {getModelsForVendor(form.vendor).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="noc-label">Status</label>
            <select className="noc-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {['online', 'warning', 'offline'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="noc-label">CPU %</label>
            <input type="number" className="noc-input" value={form.cpu} onChange={(e) => setForm({ ...form, cpu: e.target.value })} />
          </div>
          <div>
            <label className="noc-label">Memory %</label>
            <input type="number" className="noc-input" value={form.memory} onChange={(e) => setForm({ ...form, memory: e.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal open={!!details} onClose={() => setDetails(null)} title="Device Details">
        {details && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <DeviceIcon category={details.category} status={details.status} size={44} />
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{details.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{getVendor(details.vendor).name} {details.category} · {details.ip}</div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries({
                Category: details.category || details.type, Vendor: getVendor(details.vendor).name,
                Model: getModel(details.model)?.name || '—',
                Status: details.status, CPU: `${details.cpu}%`, Memory: `${details.memory}%`,
                Uptime: details.uptime, 'Last Seen': details.lastSeen,
              }).map(([k, v]) => (
                <div key={k} className="rounded-lg bg-slate-50 p-3 dark:bg-noc-panel2">
                  <dt className="text-xs text-slate-500 dark:text-slate-400">{k}</dt>
                  <dd className="mt-0.5 font-medium text-slate-800 dark:text-slate-100">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  )
}
