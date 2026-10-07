import { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu, Search, Bell, Sun, Moon, ChevronDown, CircleCheck, Server, Globe2,
  Activity, AlertTriangle, Users, Link as LinkIcon, LogOut, UserCog, Settings as Cog,
} from 'lucide-react'
import { BRAND } from '../config/branding'
import { devices, destinations, pppUsers, alertsSeed, links, users } from '../data/mockData'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../context/AuthContext'
import { useClient } from '../context/ClientContext'
import { classes, severityToTone } from '../utils/format'
import StatusBadge from './StatusBadge'
import ClientSelector from './ClientSelector'

function useClickOutside(ref, handler) {
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [ref, handler])
}

export default function Header({ title, onOpenMobile }) {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const { currentUser, logout } = useAuth()
  const { client, locked } = useClient()
  const userName = currentUser?.name || 'User'
  const userRole = currentUser?.role || 'NOC'
  const initials = userName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const [query, setQuery] = useState('')
  const [openSearch, setOpenSearch] = useState(false)
  const [openNotif, setOpenNotif] = useState(false)
  const [openUser, setOpenUser] = useState(false)

  const notifRef = useRef(null)
  const userRef = useRef(null)
  const searchRef = useRef(null)
  useClickOutside(notifRef, () => setOpenNotif(false))
  useClickOutside(userRef, () => setOpenUser(false))
  useClickOutside(searchRef, () => setOpenSearch(false))

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const out = []
    devices.forEach((d) => {
      if (`${d.name} ${d.ip} ${d.type}`.toLowerCase().includes(q))
        out.push({ type: 'Device', label: d.name, sub: `${d.type} · ${d.ip}`, to: '/devices', tone: 'info', icon: Server })
    })
    pppUsers.forEach((u) => {
      if (`${u.username} ${u.ip} ${u.mac}`.toLowerCase().includes(q))
        out.push({ type: 'PPPoE', label: u.username, sub: `${u.ip} · ${u.mac}`, to: '/ppp-watchdog', tone: 'info', icon: Users })
    })
    destinations.forEach((d) => {
      if (`${d.name} ${d.host}`.toLowerCase().includes(q))
        out.push({ type: 'Destination', label: d.name, sub: d.host, to: '/destinations', tone: 'info', icon: Globe2 })
    })
    links.forEach((l) => {
      if (l.name.toLowerCase().includes(q))
        out.push({ type: 'Link', label: l.name, sub: `${l.current}/${l.capacity} Mbps`, to: '/link-capacity', tone: 'info', icon: LinkIcon })
    })
    alertsSeed.forEach((a) => {
      if (`${a.title} ${a.device}`.toLowerCase().includes(q))
        out.push({ type: 'Alert', label: a.title, sub: `${a.device} · ${a.time}`, to: '/', tone: severityToTone(a.severity), icon: AlertTriangle })
    })
    users.forEach((u) => {
      if (`${u.name} ${u.username} ${u.role}`.toLowerCase().includes(q))
        out.push({ type: 'User', label: u.name, sub: `${u.username} · ${u.role}`, to: '/management', tone: 'info', icon: Users })
    })
    return out.slice(0, 8)
  }, [query])

  const goTo = (to) => {
    navigate(to)
    setQuery('')
    setOpenSearch(false)
  }

  const notifications = [
    { id: 1, title: 'High bandwidth detected', time: '2 minutes ago', tone: 'warning' },
    { id: 2, title: 'PPPoE session flapping', time: '8 minutes ago', tone: 'critical' },
    { id: 3, title: 'Device recovered', time: '15 minutes ago', tone: 'success' },
    { id: 4, title: 'Link latency improved', time: '25 minutes ago', tone: 'info' },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-noc-border dark:bg-noc-panel/90">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <button
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-noc-panel2"
          onClick={onOpenMobile}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-900 dark:text-white lg:text-lg">{title}</h1>
          <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
            {BRAND.name} · {BRAND.tagline}
          </p>
        </div>

        {/* Active client selector (team) or fixed client badge (client user) */}
        <div className="ml-2 hidden lg:block">
          {locked ? (
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-noc-border dark:bg-noc-panel2 dark:text-slate-100">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {client.name}
            </span>
          ) : (
            <ClientSelector />
          )}
        </div>

        {/* Search */}
        <div className="relative ml-auto hidden max-w-md flex-1 md:block" ref={searchRef}>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpenSearch(true)
            }}
            onFocus={() => setOpenSearch(true)}
            placeholder="Search devices, users, links…"
            className="noc-input pl-9"
          />
          {openSearch && query && (
            <div className="absolute left-0 right-0 top-full mt-2 animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-noc-border dark:bg-noc-panel">
              {results.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">No matches for “{query}”</div>
              ) : (
                <ul className="max-h-80 overflow-y-auto py-1">
                  {results.map((r, i) => {
                    const Icon = r.icon
                    return (
                      <li key={i}>
                        <button
                          onClick={() => goTo(r.to)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-noc-panel2"
                        >
                          <Icon className="h-4 w-4 text-slate-400" />
                          <span className="flex-1">
                            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{r.label}</span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400">{r.sub}</span>
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{r.type}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <div className="mr-1 hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 lg:flex dark:bg-emerald-500/10">
            <CircleCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">All Systems Operational</span>
          </div>

          <button
            onClick={toggle}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-noc-panel2"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif((v) => !v)}
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-noc-panel2"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            {openNotif && (
              <div className="absolute right-0 mt-2 w-80 animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-noc-border dark:bg-noc-panel">
                <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold dark:border-noc-border">
                  Notifications
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id} className="flex items-start gap-3 border-b border-slate-100 px-4 py-3 last:border-0 dark:border-noc-border/60">
                      <span className={classes('mt-1.5 h-2 w-2 rounded-full', { warning: 'bg-amber-500', critical: 'bg-red-500', success: 'bg-emerald-500', info: 'bg-brand-500' }[n.tone])} />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 dark:text-slate-200">{n.title}</p>
                        <p className="text-xs text-slate-400">{n.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <button className="w-full px-4 py-2.5 text-center text-xs font-medium text-brand-600 hover:bg-slate-50 dark:hover:bg-noc-panel2">
                  View all
                </button>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setOpenUser((v) => !v)}
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-100 dark:hover:bg-noc-panel2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {initials}
              </span>
              <span className="hidden text-left lg:block">
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">{userName}</span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400">{userRole}</span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
            </button>
            {openUser && (
              <div className="absolute right-0 mt-2 w-56 animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-noc-border dark:bg-noc-panel">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-noc-border/60">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{userRole}</p>
                </div>
                <button onClick={() => { navigate('/management'); setOpenUser(false) }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-noc-panel2">
                  <UserCog className="h-4 w-4" /> My Profile
                </button>
                <button onClick={() => { navigate('/settings'); setOpenUser(false) }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-noc-panel2">
                  <Cog className="h-4 w-4" /> Settings
                </button>
                <button onClick={() => { logout(); navigate('/login'); setOpenUser(false) }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
