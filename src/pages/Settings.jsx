import { useState } from 'react'
import {
  Settings as Cog, Network, Activity, Bell, Users, Code2, DatabaseBackup, Save, Download, Copy, Check,
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import { BRAND } from '../config/branding'
import { useToast } from '../components/Toast'
import { classes } from '../utils/format'
import { getNotifyConfig, saveNotifyConfig } from '../services/notifications'

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
          <Card title="Monitoring" subtitle="Polling intervals and thresholds">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Monitoring Interval">
                <select className="noc-input" defaultValue="30 seconds">
                  {['10 seconds', '30 seconds', '60 seconds', '5 minutes'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Ping Timeout (ms)"><input className="noc-input" defaultValue="3000" /></Field>
              <Field label="Retries"><input className="noc-input" defaultValue="2" /></Field>
              <Field label="CPU Alert Threshold (%)"><input className="noc-input" defaultValue="85" /></Field>
            </div>
            <div className="mt-4 flex justify-end"><Button icon={Save} onClick={() => save('Monitoring')}>Save Changes</Button></div>
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
