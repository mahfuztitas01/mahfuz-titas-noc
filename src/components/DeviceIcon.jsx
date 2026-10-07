import { getCategoryIcon } from '../data/vendors'
import { classes } from '../utils/format'

// Category "picture" — the icon that represents the device type
// (camera → camera, router → router, switch → switch, AP, OLT, NVR, server…).
const TONES = {
  online: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  offline: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
}

export default function DeviceIcon({ category, status, size = 36, rounded = 'rounded-lg', className }) {
  const Icon = getCategoryIcon(category)
  const tone = TONES[status] || TONES.default
  return (
    <span
      className={classes('flex shrink-0 items-center justify-center', rounded, tone, className)}
      style={{ width: size, height: size }}
      title={category}
    >
      <Icon style={{ width: Math.round(size * 0.55), height: Math.round(size * 0.55) }} />
    </span>
  )
}
