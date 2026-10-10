import { useState } from 'react'
import {
  Settings as Cog, Network, Activity, Bell, Users, Code2, DatabaseBackup, Save, Download, Copy, Check, MessageCircle, Send,
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import { BRAND } from '../config/branding'
import { useToast } from '../components/Toast'
import { classes } from '../utils/format'
import { getNotifyConfig, saveNotifyConfig, sendTelegram } from '../services/notifications'

const SECTIONS = [
  { key: 'general', label: 'General', icon: Cog },
  { key: 'network', label: 'Network', icon: Network },
  { key: 'monitoring', label: 'Monitoring', icon: Activity },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'users', label: 'Users & Roles', icon: Users },
  { key: 'api', label: 'API', icon: Code2 },
  { key: 'backup', label: 'Backup', icon: DatabaseBackup },
]

function Field({ label, children }) {
  return (
    <div>
      <label className="noc-label">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
        {description && <span className="block text-xs text-slate-500 dark:text-slate-400">{description}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={classes('relative h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600')}
        aria-pressed={checked}
      >
        <span className={classes('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </label>
  )
}

export default function Settings() {
  const { push } = useToast()
  const [section, setSection] = useState('general')
  const [copied, setCopied] = useState(false)
  const [notif, setNotif] = useState({ email: true, telegram: true, webhook: false, desktop: true })
  const [notifCfg, setNotifCfg] = useState(getNotifyConfig())
  const [backendUrl, setBackendUrl] = useState(() => {
    try {
      return localStorage.getItem('mtnoc_backend') || ''
    } catch {
      return ''
    }
  })

  const saveBackend = () => {
    try {
      localStorage.setItem('mtnoc_backend', backendUrl.trim())
    } catch {
      /* ignore */
    }
    push('Backend URL saved', 'success')
  }

  const [botUrl, setBotUrl] = useState(() => {
    try {
      return localStorage.getItem('mtnoc_bot_url') || 'http://localhost:4001'
    } catch {
      return 'http://localhost:4001'
    }
  })
  const [groupLink, setGroupLink] = useState('')
  const [botStatus, setBotStatus] = useState('')
  const [tgStatus, setTgStatus] = useState('')

  const testTelegram = async () => {
    const token = (notifCfg.telegramToken || '').trim()
    const chat = (notifCfg.telegramChatId || '').trim()
    if (!token || !chat) {
      push('Enter your Telegram bot token and chat ID first', 'error')
      return
    }
    setTgStatus('Sending…')
    try {
      await sendTelegram(
        token,
        chat,
        {
          severity: 'critical',
          title: 'Test alert — high CPU utilization',
          device: 'CORE-RT-1',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: 'This is a test alert from Mahfuz Titas NOC. Your Telegram alerts are working.',
        },
        { name: 'Test Client' }
      )
      saveNotifyConfig(notifCfg)
      setTgStatus('✅ Test sent — check your Telegram')
      push('Telegram test sent', 'success')
    } catch (err) {
      setTgStatus(`⚠️ ${err?.message || err}`)
      push('Telegram test failed', 'error')
    }
  }

  const connectBot = async () => {
    const base = botUrl.trim().replace(/\/$/, '')
    try {
      localStorage.setItem('mtnoc_bot_url', base)
    } catch {
      /* ignore */
    }
    if (!groupLink.trim()) {
      push('Paste your WhatsApp group link first', 'error')
      return
    }
    setBotStatus('Connecting…')
    try {
      const res = await fetch(`${base}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: groupLink.trim() }),
      })
      const data = await res.json()
      if (data.ok) {
        setBotStatus(`✅ Bot joined: ${data.group?.name || data.group?.jid}`)
        push('Bot connected to group', 'success')
      } else {
        setBotStatus(`⚠️ ${data.reason || data.error || 'failed'}`)
        push('Bot connect failed', 'error')
      }
    } catch {
      setBotStatus(`⚠️ Bot not reachable at ${base} — run: node baileys-bridge.js`)
      push('Bot not reachable', 'error')
    }
  }

  const saveNotify = () => {
    saveNotifyConfig(notifCfg)
    push('Notification settings saved', 'success')
  }

  const save = (what) => push(`${what} settings saved`, 'success')
  const copyKey = () => {
    navigator.clipboard?.writeText('mtnoc_live_sk_•••••7f3a').catch(() => {})
    setCopied(true)
    push('API key copied', 'success')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Section nav */}
      <nav className="space-y-1 lg:col-span-1">
        {SECTIONS.map((s) => {
          const Icon = s.icon
          return (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={classes(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                section === s.key ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-noc-panel2'
              )}
            >
              <Icon className="h-4 w-4" /> {s.label}
            </button>
          )
        })}
      </nav>

      <div className="space-y-6 lg:col-span-3">
        {section === 'general' && (
          <Card title="General" subtitle="Application identity and locale">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="System Name">
                <input className="noc-input" defaultValue={BRAND.name} />
              </Field>
              <Field label="Brand Statement">
                <input className="noc-input" defaultValue={BRAND.statement} />
              </Field>
              <Field label="Timezone">
                <select className="noc-input" defaultValue="Asia/Dhaka">
                  {['Asia/Dhaka', 'Asia/Kolkata', 'UTC', 'Asia/Dubai'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Date Format">
                <select className="noc-input" defaultValue="DD-MMM-YYYY">
                  {['DD-MMM-YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-4 flex justify-end"><Button icon={Save} onClick={() => save('General')}>Save Changes</Button></div>
          </Card>
        )}

        {section === 'network' && (
          <Card title="Network" subtitle="Monitoring credentials and defaults">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Default Gateway"><input className="noc-input" defaultValue="172.17.55.2" /></Field>
              <Field label="DNS Server"><input className="noc-input" defaultValue="8.8.8.8" /></Field>
              <Field label="SNMP Community"><input className="noc-input" type="password" defaultValue="public" /></Field>
              <Field label="SNMP Trap Port"><input className="noc-input" defaultValue="162" /></Field>
            </div>
            <div className="mt-4 flex justify-end"><Button icon={Save} onClick={() => save('Network')}>Save Changes</Button></div>
          </Card>
        )}

        {section === 'monitoring' && (
          <Card title="Monitoring" subtitle="Polling intervals, thresholds and backend">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Backend URL (cloud server for ping/WhatsApp)">
                <input className="noc-input font-mono" value={backendUrl} onChange={(e) => setBackendUrl(e.target.value)} placeholder="https://mtnoc-backend.onrender.com" />
              </Field>
              <Field label="Monitoring Interval">
                <select className="noc-input" defaultValue="30 seconds">
                  {['10 seconds', '30 seconds', '60 seconds', '5 minutes'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Ping Timeout (ms)"><input className="noc-input" defaultValue="3000" /></Field>
              <Field label="Retries"><input className="noc-input" defaultValue="2" /></Field>
              <Field label="CPU Alert Threshold (%)"><input className="noc-input" defaultValue="85" /></Field>
            </div>
            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-noc-panel2 dark:text-slate-400">
              Put your cloud backend URL here so the deployed site can reach it from any network. Leave blank to use
              this machine (localhost:4000).
            </p>
            <div className="mt-4 flex justify-end"><Button icon={Save} onClick={saveBackend}>Save Backend URL</Button></div>
          </Card>
        )}

        {section === 'notifications' && (
          <Card title="Notifications" subtitle="Where alerts are delivered">
            <div className="divide-y divide-slate-100 dark:divide-noc-border/60">
              <Toggle checked={notif.email} onChange={(v) => setNotif({ ...notif, email: v })} label="Email alerts" description="Send alerts to the NOC distribution list" />
              <Toggle checked={notif.telegram} onChange={(v) => setNotif({ ...notif, telegram: v })} label="Telegram" description="Push to the NOC Telegram chat" />
              <Toggle checked={notif.whatsapp ?? true} onChange={(v) => setNotif({ ...notif, whatsapp: v })} label="WhatsApp (via backend)" description="Backend forwards alerts to WhatsApp Cloud API" />
              <Toggle checked={notif.webhook} onChange={(v) => setNotif({ ...notif, webhook: v })} label="Webhook" description="POST alert payloads to an endpoint" />
              <Toggle checked={notif.desktop} onChange={(v) => setNotif({ ...notif, desktop: v })} label="Desktop notifications" description="Show browser notifications" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Alert Email">
                <input className="noc-input" value={notifCfg.email || ''} onChange={(e) => setNotifCfg({ ...notifCfg, email: e.target.value })} placeholder="noc@company.com" />
              </Field>
              <Field label="Webhook URL (backend)">
                <input className="noc-input" value={notifCfg.webhookUrl || ''} onChange={(e) => setNotifCfg({ ...notifCfg, webhookUrl: e.target.value })} placeholder="http://localhost:4000/alerts" />
              </Field>
            </div>
            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-noc-panel2 dark:text-slate-400">
              Threshold alerts (bandwidth / latency / CPU / PPPoE) are POSTed to this Webhook URL. The included backend
              (<code className="mx-1 rounded bg-slate-200 px-1 dark:bg-noc-border">server/</code>) forwards them to
              <strong> WhatsApp Cloud API</strong>. See <code className="mx-1 rounded bg-slate-200 px-1 dark:bg-noc-border">server/README.md</code>.
            </p>

            <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-500/20 dark:bg-sky-500/5">
              <div className="mb-2 flex items-center gap-2">
                <Send className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Telegram Alerts — no server / VM needed</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Bot token">
                  <input className="noc-input font-mono" value={notifCfg.telegramToken || ''} onChange={(e) => setNotifCfg({ ...notifCfg, telegramToken: e.target.value })} placeholder="123456789:AAExxxxxxxxxxxxxxxxxxxxxxx" />
                </Field>
                <Field label="Chat ID">
                  <input className="noc-input font-mono" value={notifCfg.telegramChatId || ''} onChange={(e) => setNotifCfg({ ...notifCfg, telegramChatId: e.target.value })} placeholder="-1001234567890" />
                </Field>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button icon={Send} onClick={testTelegram}>Send test alert</Button>
                <Button variant="outline" icon={Save} onClick={saveNotify}>Save</Button>
                {tgStatus && <span className="text-xs text-slate-500 dark:text-slate-400">{tgStatus}</span>}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Create a bot with <strong>@BotFather</strong> → copy the token. Add the bot to your group/channel, then get the
                chat ID from <code className="mx-1 rounded bg-slate-200 px-1 dark:bg-noc-border">@userinfobot</code> or the
                <code className="mx-1 rounded bg-slate-200 px-1 dark:bg-noc-border">getUpdates</code> API. Alerts are sent
                straight to Telegram from this site — works with no backend.
              </p>
            </div>

            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
              <div className="mb-2 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">WhatsApp Bot — mahfuztitasaiagent</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Bot server URL">
                  <input className="noc-input font-mono" value={botUrl} onChange={(e) => setBotUrl(e.target.value)} placeholder="http://localhost:4001" />
                </Field>
                <Field label="Your WhatsApp group link">
                  <input className="noc-input" value={groupLink} onChange={(e) => setGroupLink(e.target.value)} placeholder="https://chat.whatsapp.com/XXXXXXXX" />
                </Field>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button icon={MessageCircle} onClick={connectBot}>Connect bot to group</Button>
                {botStatus && <span className="text-xs text-slate-500 dark:text-slate-400">{botStatus}</span>}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Just paste your group link — the bot joins that group and forwards every NMS alert there. (Run the bot
                once and scan the QR to log in.)
              </p>
            </div>

            <div className="mt-4 flex justify-end"><Button icon={Save} onClick={saveNotify}>Save Changes</Button></div>
          </Card>
        )}

        {section === 'users' && (
          <Card title="Users & Roles" subtitle="Manage accounts from the Management module">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Roles: Super Admin, NOC Engineer, Support Engineer, Viewer. Manage users, roles, RADIUS and access control from the Management page.
            </p>
            <div className="mt-4">
              <a href="/management"><Button variant="outline">Open Management</Button></a>
            </div>
          </Card>
        )}

        {section === 'api' && (
          <Card title="API" subtitle="Integrate external systems">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="API Base URL"><input className="noc-input" defaultValue="https://noc.mahfuztitas.local/api/v1" /></Field>
              <Field label="API Key">
                <div className="flex gap-2">
                  <input className="noc-input font-mono" readOnly value="mtnoc_live_sk_•••••7f3a" />
                  <Button variant="outline" icon={copied ? Check : Copy} onClick={copyKey}>{copied ? 'Copied' : 'Copy'}</Button>
                </div>
              </Field>
            </div>
            <div className="mt-4 flex justify-end"><Button icon={Save} onClick={() => save('API')}>Save Changes</Button></div>
          </Card>
        )}

        {section === 'backup' && (
          <Card title="Backup" subtitle="Configuration and data backup">
            <Toggle checked onChange={() => {}} label="Automatic daily backup" description="Runs every day at 02:00 (Asia/Dhaka)" />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Backup Location"><input className="noc-input" defaultValue="/var/backups/mtnoc" /></Field>
              <Field label="Retention (days)"><input className="noc-input" defaultValue="30" /></Field>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              <Button variant="outline" icon={Download} onClick={() => push('Backup download started', 'success')}>Download Backup</Button>
              <Button icon={Save} onClick={() => save('Backup')}>Save Changes</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
