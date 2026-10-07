import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Building2, Check } from 'lucide-react'
import { useClient } from '../context/ClientContext'
import { useToast } from './Toast'
import { classes } from '../utils/format'

const DOT = { online: 'bg-emerald-500', warning: 'bg-amber-500', offline: 'bg-red-500' }

export default function ClientSelector() {
  const { client, clients, setClientId } = useClient()
  const { push } = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const choose = (c) => {
    setClientId(c.id)
    setOpen(false)
    push(`Switched to ${c.name}`, 'info')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left hover:bg-slate-50 dark:border-noc-border dark:bg-noc-panel2 dark:hover:bg-slate-700/40"
        title="Active client"
      >
        <span className={classes('h-2 w-2 shrink-0 rounded-full', DOT[client.status] || DOT.online)} />
        <Building2 className="hidden h-4 w-4 text-slate-400 sm:block" />
        <span className="max-w-[130px] truncate text-xs font-semibold text-slate-700 dark:text-slate-100">
          {client.name}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 z-40 mt-2 w-72 animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-noc-border dark:bg-noc-panel">
          <div className="border-b border-slate-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-noc-border">
            ISP Clients ({clients.length})
          </div>
          <ul className="max-h-80 overflow-y-auto py-1">
            {clients.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => choose(c)}
                  className={classes(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-noc-panel2',
                    c.id === client.id && 'bg-brand-50/60 dark:bg-brand-500/10'
                  )}
                >
                  <span className={classes('h-2 w-2 shrink-0 rounded-full', DOT[c.status] || DOT.online)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">{c.name}</span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{c.short} · {c.region} · {c.plan}</span>
                  </span>
                  {c.id === client.id && <Check className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => { setOpen(false); navigate('/clients') }}
            className="w-full border-t border-slate-200 px-4 py-2.5 text-center text-xs font-medium text-brand-600 hover:bg-slate-50 dark:border-noc-border dark:hover:bg-noc-panel2"
          >
            View all clients &amp; diagrams
          </button>
        </div>
      )}
    </div>
  )
}
