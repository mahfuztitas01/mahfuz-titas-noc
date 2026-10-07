import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { NAV_ITEMS } from '../config/navigation'

const TITLES = {
  '/': 'NOC Dashboard',
  '/clients': 'ISP Clients',
  '/destinations': 'Destinations Monitoring',
  '/devices': 'Local Devices',
  '/link-capacity': 'Link Capacity',
  '/ppp-watchdog': 'PPP Watchdog',
  '/service-graphs': 'Service Graphs',
  '/network-map': 'Network Map',
  '/management': 'Management',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const title =
    TITLES[location.pathname] ||
    NAV_ITEMS.find((n) => n.to === location.pathname)?.label ||
    'Mahfuz Titas NOC'

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-noc-bg">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200 px-6 py-3 text-center text-xs text-slate-400 dark:border-noc-border">
          Mahfuz Titas NOC — Built for ISPs &amp; Network Teams · v1.0.0
        </footer>
      </div>
    </div>
  )
}
