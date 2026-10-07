import { Loader2, Inbox } from 'lucide-react'
import { classes } from '../utils/format'

export function Spinner({ className }) {
  return <Loader2 className={classes('h-5 w-5 animate-spin text-brand-600', className)} />
}

export function EmptyState({ title = 'Nothing here', description, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="rounded-full bg-slate-100 p-3 dark:bg-noc-panel2">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
      {description && <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      {action}
    </div>
  )
}

export default Spinner
