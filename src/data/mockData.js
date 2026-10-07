// ---------------------------------------------------------------------------
// Mock data for Mahfuz Titas NOC.
// Replace these with real API/WebSocket data later (see src/services/api.js).
// ---------------------------------------------------------------------------

export const kpis = {
  onlineDevices: { value: 248, delta: '+12 today', label: 'Online Devices' },
  totalBandwidth: { value: 620, unit: 'Mbps', label: 'Total Bandwidth' },
  activeAlerts: { value: 2, label: 'Active Alerts' },
  pppoeUsers: { active: 109, total: 200, label: 'Active PPPoE Users' },
}

export const systemStatus = { label: 'All Systems Operational', state: 'ok' }

// 24h traffic (Mbps) — download / upload
export function generateTraffic(range = '24H') {
  const points = { '1H': 60, '6H': 72, '24H': 96, '7D': 84, '30D': 90 }[range] || 96
  const now = Date.now()
  const stepMs = {
    '1H': 60 * 1000,
    '6H': 5 * 60 * 1000,
    '24H': 15 * 60 * 1000,
    '7D': 2 * 60 * 60 * 1000,
    '30D': 8 * 60 * 60 * 1000,
  }[range] || 15 * 60 * 1000
  const data = []
  let seed = 7
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(now - i * stepMs)
    const hour = t.getHours()
    const daytime = Math.sin(((hour - 6) / 24) * Math.PI * 2)
    const base = 300 + Math.max(0, daytime) * 260
    const download = Math.round(base + rnd() * 90)
    const upload = Math.round(base * 0.28 + rnd() * 45)
    data.push({
      time:
        range === '7D' || range === '30D'
          ? t.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : t.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      download,
      upload,
    })
  }
  return data
}

export const linkUtilization = { used: 72, available: 28, current: 465, capacity: 650 }

export const topDestinations = [
  { name: 'Google', pct: 32, status: 'online', color: '#2563eb' },
  { name: 'Facebook', pct: 24, status: 'online', color: '#3b82f6' },
  { name: 'YouTube', pct: 18, status: 'online', color: '#60a5fa' },
  { name: 'Netflix', pct: 12, status: 'online', color: '#93c5fd' },
  { name: 'Cloudflare', pct: 8, status: 'warning', color: '#f59e0b' },
]

export const devices = [
  { id: 1, name: 'CORE-RT-1', ip: '172.17.55.1', type: 'MikroTik Router', status: 'online', cpu: 42, memory: 58, uptime: '37d 4h', lastSeen: 'Just now' },
  { id: 2, name: 'EDGE-RT-1', ip: '10.0.0.1', type: 'MikroTik Router', status: 'online', cpu: 55, memory: 63, uptime: '22d 11h', lastSeen: 'Just now' },
  { id: 3, name: 'CORE-SW-1', ip: '172.17.55.10', type: 'Core Switch', status: 'online', cpu: 31, memory: 44, uptime: '61d 2h', lastSeen: 'Just now' },
  { id: 4, name: 'OLT-01', ip: '172.17.55.20', type: 'OLT', status: 'online', cpu: 38, memory: 51, uptime: '45d 7h', lastSeen: 'Just now' },
  { id: 5, name: 'NVR-01', ip: '172.17.55.23', type: 'NVR', status: 'online', cpu: 66, memory: 72, uptime: '18d 3h', lastSeen: '1 min ago' },
  { id: 6, name: 'AP-01', ip: '172.17.55.30', type: 'Access Point', status: 'warning', cpu: 81, memory: 77, uptime: '9d 16h', lastSeen: '30s ago' },
]

export const pppStats = {
  total: 200,
  active: 109,
  offline: 91,
  suspicious: 3,
  flapping: 2,
  highUsage: 7,
}

export const pppUsers = [
  { username: 'user001', ip: '10.10.10.21', mac: 'AA:BB:CC:DD:EE:01', uptime: '3h 24m', download: 45, upload: 12, status: 'online' },
  { username: 'user002', ip: '10.10.10.22', mac: 'AA:BB:CC:DD:EE:02', uptime: '21h 02m', download: 88, upload: 30, status: 'online' },
  { username: 'user003', ip: '10.10.10.23', mac: 'AA:BB:CC:DD:EE:03', uptime: '0h 04m', download: 6, upload: 2, status: 'flapping' },
  { username: 'user004', ip: '10.10.10.24', mac: 'AA:BB:CC:DD:EE:04', uptime: '—', download: 0, upload: 0, status: 'offline' },
  { username: 'user005', ip: '10.10.10.25', mac: 'AA:BB:CC:DD:EE:05', uptime: '12h 45m', download: 130, upload: 41, status: 'suspicious' },
  { username: 'user006', ip: '10.10.10.26', mac: 'AA:BB:CC:DD:EE:06', uptime: '5h 10m', download: 52, upload: 18, status: 'online' },
  { username: 'user007', ip: '10.10.10.27', mac: 'AA:BB:CC:DD:EE:07', uptime: '48h 30m', download: 210, upload: 66, status: 'high' },
  { username: 'user008', ip: '10.10.10.28', mac: 'AA:BB:CC:DD:EE:08', uptime: '2h 12m', download: 22, upload: 9, status: 'online' },
]

export const links = [
  {
    id: 'primary', name: 'Primary ISP', capacity: 500, current: 320, peak: 470,
    utilization: 64, availability: 99.98, latency: 11, loss: 0.0, status: 'Healthy',
  },
  {
    id: 'backup', name: 'Backup ISP', capacity: 300, current: 145, peak: 260,
    utilization: 48, availability: 99.91, latency: 23, loss: 0.1, status: 'Healthy',
  },
]

export const destinations = [
  { name: 'Google DNS', host: '8.8.8.8', latency: 12, loss: 0, availability: 99.99, status: 'online', lastCheck: '10s ago' },
  { name: 'Cloudflare DNS', host: '1.1.1.1', latency: 9, loss: 0, availability: 99.99, status: 'online', lastCheck: '10s ago' },
  { name: 'Facebook', host: 'facebook.com', latency: 28, loss: 0.2, availability: 99.8, status: 'online', lastCheck: '15s ago' },
  { name: 'YouTube', host: 'youtube.com', latency: 34, loss: 0.1, availability: 99.9, status: 'online', lastCheck: '12s ago' },
  { name: 'Netflix', host: 'netflix.com', latency: 62, loss: 1.4, availability: 98.7, status: 'warning', lastCheck: '20s ago' },
]

export const alertsSeed = [
  { id: 1, title: 'High bandwidth utilization', severity: 'warning', device: 'CORE-RT-1', time: '10:42 AM', status: 'open', description: 'Interface ether1 utilization above 85% for 10 minutes.' },
  { id: 2, title: 'PPPoE session flapping', severity: 'medium', device: 'EDGE-RT-1', time: '10:15 AM', status: 'open', description: 'Session for user003 dropped/reconnected 4 times in 5 minutes.' },
  { id: 3, title: 'High latency detected', severity: 'warning', device: 'Google DNS', time: '09:58 AM', status: 'acknowledged', description: 'Round-trip latency exceeded 60 ms threshold.' },
  { id: 4, title: 'High CPU utilization', severity: 'critical', device: 'CORE-RT-1', time: '09:40 AM', status: 'open', description: 'CPU sustained above 90% for 3 minutes.' },
]

export const notificationsSeed = [
  { id: 1, title: 'High bandwidth detected', time: '2 minutes ago', tone: 'warning', read: false },
  { id: 2, title: 'PPPoE session flapping', time: '8 minutes ago', tone: 'critical', read: false },
  { id: 3, title: 'Device recovered', time: '15 minutes ago', tone: 'success', read: true },
  { id: 4, title: 'Link latency improved', time: '25 minutes ago', tone: 'info', read: true },
]

export const roles = ['Super Admin', 'NOC Engineer', 'Support Engineer', 'Client', 'Viewer']

export const users = [
  { id: 1, name: 'Mahfuz Titas', username: 'mahfuz', role: 'Super Admin', status: 'active', lastLogin: 'Today, 09:12' },
  { id: 2, name: 'Rahat Hossain', username: 'rahat', role: 'NOC Engineer', status: 'active', lastLogin: 'Today, 08:40' },
  { id: 3, name: 'Sadia Islam', username: 'sadia', role: 'Support Engineer', status: 'active', lastLogin: 'Yesterday, 18:22' },
  { id: 4, name: 'Arif Khan', username: 'arif', role: 'Viewer', status: 'disabled', lastLogin: '12 Sep, 11:05' },
]

export const reports = [
  'Daily Traffic Report',
  'Bandwidth Utilization',
  'Device Availability',
  'PPPoE User Report',
  'Link Performance Report',
  'Network Incident Report',
  'Monthly NOC Summary',
]

export const serviceMetrics = [
  { key: 'bandwidth', label: 'Bandwidth', unit: 'Mbps', color: '#2563eb', base: 420, spread: 120 },
  { key: 'latency', label: 'Latency', unit: 'ms', color: '#0ea5e9', base: 18, spread: 24 },
  { key: 'loss', label: 'Packet Loss', unit: '%', color: '#f59e0b', base: 0.6, spread: 2.4 },
  { key: 'cpu', label: 'CPU Usage', unit: '%', color: '#8b5cf6', base: 44, spread: 40 },
  { key: 'memory', label: 'Memory Usage', unit: '%', color: '#ec4899', base: 58, spread: 26 },
  { key: 'traffic', label: 'Interface Traffic', unit: 'Mbps', color: '#10b981', base: 300, spread: 160 },
  { key: 'pppoe', label: 'PPPoE Sessions', unit: '', color: '#6366f1', base: 110, spread: 18 },
  { key: 'availability', label: 'Device Availability', unit: '%', color: '#22c55e', base: 99.5, spread: 0.6 },
]

export const topology = {
  nodes: [
    { id: 'internet', label: 'Internet', ip: '—', status: 'online', tier: 0 },
    { id: 'isp', label: 'Upstream ISP', ip: '103.10.0.1', status: 'online', tier: 1 },
    { id: 'core', label: 'Core MikroTik Router', ip: '172.17.55.1', status: 'online', tier: 2 },
    { id: 'fw', label: 'Firewall / Gateway', ip: '172.17.55.2', status: 'online', tier: 3 },
    { id: 'sw', label: 'Core Switch', ip: '172.17.55.10', status: 'online', tier: 4 },
    { id: 'olt', label: 'OLT', ip: '172.17.55.20', status: 'online', tier: 5 },
    { id: 'servers', label: 'Servers', ip: '172.17.55.40', status: 'online', tier: 5 },
    { id: 'ap', label: 'AP', ip: '172.17.55.30', status: 'warning', tier: 5 },
    { id: 'fttx', label: 'FTTx Users', ip: '—', status: 'online', tier: 6 },
    { id: 'pppoe', label: 'PPPoE Users', ip: '10.10.10.0/24', status: 'online', tier: 6 },
  ],
  edges: [
    ['internet', 'isp'], ['isp', 'core'], ['core', 'fw'], ['fw', 'sw'],
    ['sw', 'olt'], ['sw', 'servers'], ['sw', 'ap'], ['olt', 'fttx'],
  ],
}
