import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'
import { classes } from '../utils/format'

const ToastContext = createContext(null)

const TONES = {
  success: { icon: CheckCircle2, ring: 'ring-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400' },
  error: { icon: XCircle, ring: 'ring-red-500/30', text: 'text-red-600 dark:text-red-400' },
  warning: { icon: AlertTriangle, ring: 'ring-amber-500/30', text: 'text-amber-600 dark:text-amber-400' },
  info: { icon: Info, ring: 'ring-brand-500/30', text: 'text-brand-600 dark:text-brand-400' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback(
    (message, tone = 'info', timeout = 3500) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((t) => [...t, { id, message, tone }])
      if (timeout) setTimeout(() => remove(id), timeout)
    },
    [remove]
  )

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const conf = TONES[t.tone] || TONES.info
          const Icon = conf.icon
          return (
            <div
              key={t.id}
              className={classes(
                'pointer-events-auto flex animate-slide-in items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg ring-1 ring-inset dark:border-noc-border dark:bg-noc-panel',
                conf.ring
              )}
            >
              <Icon className={classes('mt-0.5 h-4 w-4 shrink-0', conf.text)} />
              <p className="flex-1 text-sm text-slate-700 dark:text-slate-200">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) return { push: () => {} }
  return ctx
}
