import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { BRAND } from '../config/branding'
import { LogoMark } from '../components/Logo'
import Button from '../components/Button'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'

const DEMO = [
  { label: 'Super Admin (ISP team)', username: 'mahfuz', password: 'admin123' },
  { label: 'NOC Engineer (ISP team)', username: 'rahat', password: 'rahat123' },
  { label: 'Client — Rahim ISP', username: 'rahim', password: 'rahim123' },
  { label: 'Client — Karim Broadband', username: 'karim', password: 'karim123' },
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { push } = useToast()
  const { currentUser, login } = useAuth()
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // already logged in → go to dashboard
  if (currentUser) return <Navigate to={location.state?.from || '/'} replace />

  const submit = (e) => {
    e.preventDefault()
    if (!username || !password) {
      push('Please enter username and password', 'error')
      return
    }
    const res = login(username, password)
    if (!res.ok) {
      push(res.error, 'error')
      return
    }
    push(`Welcome, ${res.user.name}`, 'success')
    navigate(location.state?.from || '/', { replace: true })
  }

  const fill = (d) => {
    setUsername(d.username)
    setPassword(d.password)
  }

  return (
    <div className="noc-card animate-fade-in p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <LogoMark size={52} />
        <h1 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          MAHFUZ TITAS <span className="text-brand-600 dark:text-brand-400">NOC</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{BRAND.subtitle}</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="noc-label" htmlFor="email">Username / Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="noc-input pl-9"
              placeholder="username"
            />
          </div>
        </div>

        <div>
          <label className="noc-label" htmlFor="password">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="noc-input pl-9 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => push('Password reset link sent to your email', 'info')}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" icon={LogIn} size="lg" className="w-full">
          Sign In
        </Button>
      </form>

      {/* Demo accounts */}
      <div className="mt-6 rounded-lg border border-slate-200 p-3 dark:border-noc-border">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Demo accounts (click to fill)</p>
        <div className="grid grid-cols-2 gap-1.5">
          {DEMO.map((d) => (
            <button
              key={d.username}
              type="button"
              onClick={() => fill(d)}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-left text-[11px] hover:bg-slate-50 dark:border-noc-border dark:hover:bg-noc-panel2"
            >
              <span className="block font-semibold text-slate-700 dark:text-slate-200">{d.username}</span>
              <span className="block text-slate-400">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        {BRAND.name} — {BRAND.statement}
      </p>
    </div>
  )
}
