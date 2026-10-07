// Central navigation config for the sidebar.
import {
  LayoutDashboard,
  Building2,
  Globe2,
  Server,
  Gauge,
  Activity,
  LineChart,
  Network,
  ShieldCheck,
  FileText,
  Settings as SettingsIcon,
} from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/clients', label: 'Clients', icon: Building2, teamOnly: true },
  { to: '/destinations', label: 'Destinations', icon: Globe2 },
  { to: '/devices', label: 'Local Devices', icon: Server },
  { to: '/link-capacity', label: 'Link Capacity', icon: Gauge },
  { to: '/ppp-watchdog', label: 'PPP Watchdog', icon: Activity },
  { to: '/service-graphs', label: 'Service Graphs', icon: LineChart },
  { to: '/network-map', label: 'Network Map', icon: Network },
  { to: '/management', label: 'Management', icon: ShieldCheck, teamOnly: true },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, teamOnly: true },
]
