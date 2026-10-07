import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { classes } from '../utils/format'

const TONE_BG = {
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  critical: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  info: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  muted: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
}

export default function StatCard({ icon: Icon, label, value, unit, sub, tone = 'info', trend }) {
  return (
    <div className="noc-card noc-card-hover group p-5">
      <div className="flex items-start justify-between">
        <div className={classes('rounded-xl p-2.5', TONE_BG[tone] || TONE_BG.info)}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        {trend && (
          <span
            className={classes(
              'inline-flex items-center gap-0.5 text-xs font-medium',
              trend.dir === 'down' ? 'text-red-500' : 'text-emerald-500'
            )}
          >
            {trend.dir === 'down' ? (
              <ArrowDownRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowUpRight className="h-3.5 w-3.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </span>
          {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
        </div>
        {sub && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
      </div>
    </div>
  )
}
