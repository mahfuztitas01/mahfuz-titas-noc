import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Network, Gauge, Users, AlertTriangle, ArrowRight, Activity,
  Pencil, Save, Send, RefreshCw,
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import Modal from '../components/Modal'
import { useClient } from '../context/ClientContext'
import { useToast } from '../components/Toast'
import { buildClientData } from '../data/clients'
import { statusToTone } from '../utils/format'
import { getNotifyConfig } from '../services/notifications'
import { resolveTelegramChat } from '../services/telegram'

const EMPTY_FORM = { name: '', short: '', contact: '', region: '', plan: 'Business', telegramChatId: '', telegramToken: '', telegramGroupName: '' }

export default function Clients() {
  const { clients, clientId, setClientId, updateContact } = useClient()
  const { push } = useToast()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [tgStatus, setTgStatus] = useState('')

  const enriched = useMemo(() => clients.map((c) => ({ ...c, data: buildClientData(c) })), [clients])

  const online = enriched.filter((c) => c.status === 'online').length
  const warning = enriched.filter((c) => c.status === 'warning').length

  const open = (c, to) => {
    setClientId(c.id)
    navigate(to)
  }

  const startEdit = (c) => {
    setEditing(c)
    setTgStatus('')
    setForm({
      name: c.name || '',
      short: c.short || '',
      contact: c.contact || '',
      region: c.region || '',
      plan: c.plan || 'Business',
      telegramChatId: c.telegramChatId || '',
      telegramToken: c.telegramToken || '',
      telegramGroupName: c.telegramGroupName || '',
    })
  }

  const saveEdit = () => {
    if (editing) {
      const name = form.name.trim() || editing.name
      updateContact(editing.id, {
        name,
        short: (form.short.trim() || editing.short).toUpperCase(),
        contact: form.contact.trim(),
        region: form.region.trim(),
        plan: form.plan,
        telegramChatId: form.telegramChatId.trim(),
        telegramToken: form.telegramToken.trim(),
        telegramGroupName: form.telegramGroupName.trim(),
      })
      push(`Saved ${name}`, 'success')
    }
    setEditing(null)
  }

  const connectTelegram = async () => {
    const token = (form.telegramToken || getNotifyConfig().telegramToken || '').trim()
    if (!token) {
      setTgStatus('⚠️ Set your Telegram bot token in Settings → Notifications first')
      return
    }
    setTgStatus('Connecting…')
    try {
      const res = await resolveTelegramChat(token, form.telegramChatId)
      if (!res.ok) {
        setTgStatus(`⚠️ ${res.reason}`)
        return
      }
      setForm((f) => ({ ...f, telegramChatId: res.chatId, telegramGroupName: res.title || f.telegramGroupName }))
      setTgStatus(`✅ Connected: ${res.title || res.chatId}`)
      push('Telegram group connected', 'success')
    } catch (err) {
      setTgStatus(`⚠️ ${err?.message || err}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><Building2 className="h-5 w-5" /></span>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{clients.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total ISP Clients</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><Activity className="h-5 w-5" /></span>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{online}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Healthy</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"><AlertTriangle className="h-5 w-5" /></span>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{warning}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Needs Attention</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><Network className="h-5 w-5" /></span>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{enriched.reduce((s, c) => s + c.data.devices.length, 0)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Devices</div>
            </div>
          </div>
        </Card>
      </div>

      {/* client cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {enriched.map((c) => {
          const d = c.data
          const lu = d.linkUtilization
          const active = c.id === clientId
          return (
            <Card key={c.id} className={active ? 'ring-2 ring-brand-500/40' : ''}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">{(c.short || c.name || '?').slice(0, 3).toUpperCase()}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{c.region} · {c.plan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <StatusBadge tone={statusToTone(c.status)} label={c.status} />
                  <button
                    onClick={() => startEdit(c)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-noc-panel2"
                    title="Edit client"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Telegram group */}
              <div className="mt-3 rounded-lg bg-sky-50 px-3 py-2 dark:bg-sky-500/10">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wide text-sky-600/80 dark:text-sky-400/80">Telegram group · alerts here</div>
                    <div className="truncate text-xs font-semibold text-sky-800 dark:text-sky-300">{c.telegramGroupName || (c.telegramChatId ? 'Connected' : '— not set —')}</div>
                  </div>
                </div>
                <div className="mt-1 truncate font-mono text-[11px] text-sky-700/80 dark:text-sky-400/70">{c.telegramChatId || 'add group link →'}</div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-noc-panel2">
                  <Network className="mx-auto h-3.5 w-3.5 text-slate-400" />
                  <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{d.kpis.onlineDevices}</div>
                  <div className="text-[10px] uppercase text-slate-400">devices</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-noc-panel2">
                  <Users className="mx-auto h-3.5 w-3.5 text-slate-400" />
                  <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{d.kpis.pppoe.active}</div>
                  <div className="text-[10px] uppercase text-slate-400">pppoe</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-noc-panel2">
                  <AlertTriangle className="mx-auto h-3.5 w-3.5 text-slate-400" />
                  <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{d.alerts.length}</div>
                  <div className="text-[10px] uppercase text-slate-400">alerts</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> Link utilization</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{lu.used}%</span>
                </div>
                <ProgressBar value={lu.used} tone={lu.used > 85 ? 'critical' : lu.used > 65 ? 'warning' : 'success'} />
                <div className="mt-1 text-[11px] text-slate-400">{lu.current} / {lu.capacity} Mbps</div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" icon={ArrowRight} onClick={() => open(c, '/')}>Dashboard</Button>
                <Button size="sm" variant="outline" icon={Network} onClick={() => open(c, '/network-map')}>Diagram</Button>
                <Button size="sm" variant="ghost" icon={Pencil} onClick={() => startEdit(c)}>Edit</Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* edit modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit — ${editing.name}` : 'Edit client'}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button icon={Save} onClick={saveEdit}>Save</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="noc-label">ISP name</label>
            <input className="noc-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rony Bhai ISP Kushtia" />
          </div>
          <div>
            <label className="noc-label">Contact email</label>
            <input className="noc-input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="noc@client.com" />
          </div>
          <div>
            <label className="noc-label">Region</label>
            <input className="noc-input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          </div>
          <div>
            <label className="noc-label">Plan</label>
            <select className="noc-input" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
              {['Starter', 'Business', 'Enterprise'].map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2 rounded-lg border border-sky-200 bg-sky-50/50 p-3 dark:border-sky-500/20 dark:bg-sky-500/5">
            <div className="mb-2 flex items-center gap-2">
              <Send className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Telegram group — alerts here</span>
            </div>
            <label className="noc-label">Telegram group link (or chat ID)</label>
            <input className="noc-input font-mono" value={form.telegramChatId} onChange={(e) => setForm({ ...form, telegramChatId: e.target.value })} placeholder="https://t.me/+xxxxxxxx" />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Button size="sm" icon={RefreshCw} onClick={connectTelegram}>Connect bot to group</Button>
              {form.telegramGroupName && <span className="text-xs font-medium text-sky-700 dark:text-sky-300">Group: {form.telegramGroupName}</span>}
            </div>
            {tgStatus && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{tgStatus}</p>}
            <p className="mt-2 text-[11px] text-slate-400">
              Add your bot to this ISP's Telegram group, paste the <strong>group link</strong> and press
              <strong> Connect bot to group</strong>. This ISP's alerts — including the <strong>20s device-down</strong> alert — go to
              this group. The bot token is taken from Settings → Notifications (or enter one below).
            </p>
            <div className="mt-2">
              <label className="noc-label">Telegram bot token (optional — else uses Settings)</label>
              <input className="noc-input font-mono" value={form.telegramToken} onChange={(e) => setForm({ ...form, telegramToken: e.target.value })} placeholder="leave empty to use Settings" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
