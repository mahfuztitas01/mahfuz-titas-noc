import { useState } from 'react'
import { Users, ShieldCheck, KeyRound, Lock, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { roles } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { classes, statusToTone } from '../utils/format'

const TABS = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'roles', label: 'Roles', icon: ShieldCheck },
  { key: 'radius', label: 'RADIUS', icon: KeyRound },
  { key: 'access', label: 'Access Control', icon: Lock },
]

const ACCESS_RULES = [
  { id: 1, rule: 'NOC Engineers — full read/write to monitoring', allow: true },
  { id: 2, rule: 'Support Engineers — read + acknowledge alerts', allow: true },
  { id: 3, rule: 'Viewers — read-only dashboards', allow: true },
  { id: 4, rule: 'Block SSH from outside management VLAN', allow: false },
]

const EMPTY = { name: '', username: '', role: 'NOC Engineer', status: 'active', password: '' }

export default function Management() {
  const { push } = useToast()
  const { users: userList, addUser, updateUser, removeUser } = useAuth()
  const [tab, setTab] = useState('users')
  const [modal, setModal] = useState(null) // { mode: 'add' | 'edit' }
  const [form, setForm] = useState(EMPTY)
  const [showPw, setShowPw] = useState(false)

  const openAdd = () => { setForm(EMPTY); setModal({ mode: 'add' }) }
  const openEdit = (row) => { setForm({ ...row, password: '' }); setModal({ mode: 'edit' }) }

  const save = () => {
    const { password, ...rest } = form
    if (!form.name.trim() || !form.username.trim()) {
      push('Name and username are required', 'error')
      return
    }
    if (modal.mode === 'add' && (!password || password.length < 6)) {
      push('Password (minimum 6 characters) is required for new users', 'error')
      return
    }
    if (modal.mode === 'add') {
      addUser({ ...rest, password, lastLogin: 'Never' })
      push(`User ${form.username} created`, 'success')
    } else {
      updateUser(form.id, { ...rest, ...(password ? { password } : {}) })
      push(password ? `Password updated for ${form.username}` : `User ${form.username} updated`, 'success')
    }
    setShowPw(false)
    setModal(null)
  }

  const remove = (row) => {
    removeUser(row.id)
    push(`User ${row.username} deleted`, 'warning')
  }

  const columns = [
    { key: 'name', header: 'Name', render: (r) => <span className="font-medium text-slate-800 dark:text-slate-100">{r.name}</span> },
    { key: 'username', header: 'Username', render: (r) => <span className="font-mono text-xs">{r.username}</span> },
    { key: 'role', header: 'Role', render: (r) => <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-noc-panel2 dark:text-slate-300">{r.role}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge tone={statusToTone(r.status)} label={r.status} /> },
    { key: 'lastLogin', header: 'Last Login' },
    { key: 'actions', header: '', align: 'right', render: (r) => (
      <div className="flex items-center justify-end gap-1">
        <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-noc-panel2" onClick={() => openEdit(r)} title="Edit user"><Pencil className="h-4 w-4" /></button>
        <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-noc-panel2" onClick={() => remove(r)} title="Delete user"><Trash2 className="h-4 w-4" /></button>
      </div>
    ) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-noc-border dark:bg-noc-panel">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={classes(
                'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition',
                tab === t.key ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-noc-panel2'
              )}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'users' && (
        <Card
          title="Users"
          subtitle={`${userList.length} accounts`}
          action={<Button size="sm" icon={Plus} onClick={openAdd}>Add User</Button>}
        >
          <DataTable columns={columns} data={userList} rowKey={(r) => r.id} />
        </Card>
      )}

      {tab === 'roles' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {roles.map((r) => (
            <Card key={r}>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><ShieldCheck className="h-4 w-4" /></span>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r}</h3>
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {r === 'Super Admin' && 'Full access to all modules, users and settings.'}
                {r === 'NOC Engineer' && 'Monitor, manage devices, acknowledge and resolve alerts.'}
                {r === 'Support Engineer' && 'Read access plus alert acknowledgement.'}
                {r === 'Client' && 'Scoped to a single ISP client — monitors only that client.'}
                {r === 'Viewer' && 'Read-only access to dashboards and reports.'}
              </p>
            </Card>
          ))}
        </div>
      )}

      {tab === 'radius' && (
        <Card title="RADIUS" subtitle="Authentication server configuration">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="noc-label">RADIUS Server</label><input className="noc-input" defaultValue="172.17.55.50" /></div>
            <div><label className="noc-label">Auth Port</label><input className="noc-input" defaultValue="1812" /></div>
            <div><label className="noc-label">Accounting Port</label><input className="noc-input" defaultValue="1813" /></div>
            <div><label className="noc-label">Shared Secret</label><input className="noc-input" type="password" defaultValue="secret" /></div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => push('RADIUS settings saved', 'success')}>Save</Button>
          </div>
        </Card>
      )}

      {tab === 'access' && (
        <Card title="Access Control" subtitle="Role-based access rules">
          <ul className="divide-y divide-slate-100 dark:divide-noc-border/60">
            {ACCESS_RULES.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-sm text-slate-700 dark:text-slate-200">{a.rule}</span>
                <StatusBadge tone={a.allow ? 'success' : 'critical'} label={a.allow ? 'Allow' : 'Deny'} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit User' : 'Add User'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save}>{modal?.mode === 'edit' ? 'Save Changes' : 'Create User'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="noc-label">Full Name</label>
            <input className="noc-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rahim Uddin" />
          </div>
          <div>
            <label className="noc-label">Username</label>
            <input className="noc-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="rahim" />
          </div>
          <div>
            <label className="noc-label">Role</label>
            <select className="noc-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {roles.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="noc-label">Status</label>
            <select className="noc-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {['active', 'disabled'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="noc-label">
              {modal?.mode === 'edit' ? 'New password (leave blank to keep current)' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPw ? 'text' : 'password'}
                className="noc-input pl-9 pr-10"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={modal?.mode === 'edit' ? '•••••••• (unchanged)' : 'minimum 6 characters'}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Set or reset the login password here. (In the real backend this maps to a secure password-hash update.)
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
