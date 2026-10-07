import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { NAV_ITEMS } from '../config/navigation'
import { BRAND } from '../config/branding'
import { useAuth } from '../context/AuthContext'
import { LogoMark } from './Logo'
import { classes } from '../utils/format'

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  const { currentUser } = useAuth()
  const isClient = !!currentUser?.isClient
  const items = NAV_ITEMS.filter((n) => !(isClient && n.teamOnly))
  const width = collapsed ? 'lg:w-[76px]' : 'lg:w-[260px]'

  const content = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className={classes('flex items-center gap-3 px-4 py-5', collapsed && 'lg:justify-center lg:px-2')}>
        <LogoMark size={36} />
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              MAHFUZ TITAS <span className="text-brand-600 dark:text-brand-400">NOC</span>
            </div>
            <div className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {BRAND.short}
            </div>
          </div>
        )}
        <button
          className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-noc-panel2"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                classes(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                  collapsed && 'lg:justify-center lg:px-0',
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-noc-panel2 dark:hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={classes('h-[18px] w-[18px] shrink-0', isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200')} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Status + collapse */}
      <div className="border-t border-slate-200 p-3 dark:border-noc-border">
        <div className={classes('mb-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-500/10', collapsed && 'lg:justify-center lg:px-0')}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          {!collapsed && <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">NOC Online</span>}
        </div>
        <button
          onClick={onToggle}
          className="hidden w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 lg:flex dark:text-slate-400 dark:hover:bg-noc-panel2"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (<><ChevronLeft className="h-4 w-4" /> Collapse</>)}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside
        className={classes(
          'hidden shrink-0 border-r border-slate-200 bg-white transition-[width] duration-200 lg:block dark:border-noc-border dark:bg-noc-panel',
          width
        )}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      <div className={classes('fixed inset-0 z-50 lg:hidden', mobileOpen ? '' : 'pointer-events-none')}>
        <div
          className={classes('absolute inset-0 bg-slate-900/50 transition-opacity', mobileOpen ? 'opacity-100' : 'opacity-0')}
          onClick={onCloseMobile}
        />
        <div
          className={classes(
            'absolute left-0 top-0 h-full w-[260px] border-r border-slate-200 bg-white transition-transform duration-200 dark:border-noc-border dark:bg-noc-panel',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {content}
        </div>
      </div>
    </>
  )
}
