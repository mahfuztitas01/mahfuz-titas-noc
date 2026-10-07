import { classes } from '../utils/format'

const BARS = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
  info: 'bg-brand-500',
}

export default function ProgressBar({ value, max = 100, tone = 'info', showLabel = false, height = 'h-2' }) {
  const pctVal = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{value}</span>
          <span>{Math.round(pctVal)}%</span>
        </div>
      )}
      <div className={classes('w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/60', height)}>
        <div
          className={classes('h-full rounded-full transition-all duration-700', BARS[tone] || BARS.info)}
          style={{ width: `${pctVal}%` }}
        />
      </div>
    </div>
  )
}
