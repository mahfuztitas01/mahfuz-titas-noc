import { classes } from '../utils/format'

const TONES = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400',
  critical: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400',
  info: 'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-400',
  muted: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400',
}

const DOTS = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
  info: 'bg-brand-500',
  muted: 'bg-slate-400',
}

export default function StatusBadge({ tone = 'muted', label, dot = true, className }) {
  return (
    <span
      className={classes(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        TONES[tone] || TONES.muted,
        className
      )}
    >
      {dot && <span className={classes('h-1.5 w-1.5 rounded-full', DOTS[tone] || DOTS.muted)} />}
      {label}
    </span>
  )
}
