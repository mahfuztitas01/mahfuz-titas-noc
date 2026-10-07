import { classes } from '../utils/format'

export default function Card({ title, subtitle, action, className, bodyClassName, children }) {
  return (
    <section className={classes('noc-card', className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-noc-border">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={classes('p-5', bodyClassName)}>{children}</div>
    </section>
  )
}
