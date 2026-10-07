// Small formatting / helper utilities.

export const classes = (...parts) => parts.filter(Boolean).join(' ')

export const pct = (n, digits = 0) => `${Number(n).toFixed(digits)}%`

export const mbps = (n) => `${Math.round(n)} Mbps`

export const uptimeLabel = (checks) => {
  if (checks == null) return '—'
  return `${checks} checks`
}

export const toneClasses = {
  success: {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/30',
  },
  warning: {
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/30',
  },
  critical: {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10',
    dot: 'bg-red-500',
    ring: 'ring-red-500/30',
  },
  info: {
    text: 'text-brand-600 dark:text-brand-400',
    bg: 'bg-brand-50 dark:bg-brand-500/10',
    dot: 'bg-brand-500',
    ring: 'ring-brand-500/30',
  },
  muted: {
    text: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-500/10',
    dot: 'bg-slate-400',
    ring: 'ring-slate-400/30',
  },
}

export const statusToTone = (status) => {
  switch (status) {
    case 'online':
    case 'active':
    case 'ok':
    case 'Healthy':
      return 'success'
    case 'warning':
    case 'medium':
    case 'flapping':
    case 'high':
    case 'suspicious':
      return 'warning'
    case 'offline':
    case 'disabled':
    case 'critical':
      return 'critical'
    default:
      return 'muted'
  }
}

export const severityToTone = (sev) => {
  switch ((sev || '').toLowerCase()) {
    case 'critical':
      return 'critical'
    case 'high':
    case 'medium':
      return 'warning'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'muted'
  }
}
