// ---------------------------------------------------------------------------
// Multi-tenant clients.
// Each ISP client has its OWN isolate: devices, links, PPPoE users, alerts,
// destinations and network topology (diagram). Monitoring is per-client.
// Replace buildClientData() with real API calls keyed by client id later.
// ---------------------------------------------------------------------------

function seeded(seed) {
  let s = seed % 233280
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export const CLIENTS = [
  { id: 'rahim', name: 'Rahim ISP Networks', short: 'RIM', region: 'Dhaka', plan: 'Enterprise', status: 'online', contact: 'rahim@ispbd.net', whatsapp: '8801710000001', seed: 11, base: 10 },
  { id: 'karim', name: 'Karim Broadband', short: 'KAR', region: 'Narayanganj', plan: 'Business', status: 'online', contact: 'karim@broadband.bd', whatsapp: '8801710000002', seed: 22, base: 20 },
  { id: 'sangram', name: 'Sangram Online', short: 'SAN', region: 'Chattogram', plan: 'Enterprise', status: 'warning', contact: 'noc@sangram.com', whatsapp: '8801710000003', seed: 33, base: 30 },
  { id: 'nabin', name: 'Nabin Net', short: 'NAB', region: 'Sylhet', plan: 'Starter', status: 'online', contact: 'info@nabinnet.bd', whatsapp: '8801710000004', seed: 44, base: 40 },
  { id: 'sakib', name: 'Sakib Cyber', short: 'SAK', region: 'Khulna', plan: 'Business', status: 'online', contact: 'sakib@cyber.net', whatsapp: '8801710000005', seed: 55, base: 50 },
  { id: 'titaslink', name: 'TitasLink', short: 'TTL', region: 'Gazipur', plan: 'Enterprise', status: 'online', contact: 'support@titaslink.bd', whatsapp: '8801710000006', seed: 66, base: 60 },
  { id: 'bismillah', name: 'Bismillah ISP', short: 'BIS', region: 'Bogura', plan: 'Starter', status: 'warning', contact: 'bismillah@isp.com', whatsapp: '8801710000007', seed: 77, base: 70 },
  { id: 'fastnet', name: 'FastNet BD', short: 'FST', region: 'Rajshahi', plan: 'Business', status: 'online', contact: 'hello@fastnet.bd', whatsapp: '8801710000008', seed: 88, base: 80 },
  { id: 'delta', name: 'Delta Broadband', short: 'DLT', region: 'Barishal', plan: 'Business', status: 'online', contact: 'delta@bb.net', whatsapp: '8801710000009', seed: 99, base: 90 },
  { id: 'prime', name: 'Prime Online', short: 'PRM', region: 'Rangpur', plan: 'Starter', status: 'online', contact: 'prime@online.bd', whatsapp: '8801710000010', seed: 111, base: 100 },
  { id: 'nexus', name: 'Nexus Networks', short: 'NEX', region: 'Cumilla', plan: 'Business', status: 'online', contact: 'noc@nexus.bd', whatsapp: '8801710000011', seed: 121, base: 110 },
  { id: 'orbital', name: 'Orbital Broadband', short: 'ORB', region: 'Mymensingh', plan: 'Enterprise', status: 'online', contact: 'support@orbital.net', whatsapp: '8801710000012', seed: 131, base: 120 },
  { id: 'connect', name: 'Connect Zone', short: 'CNZ', region: "Cox's Bazar", plan: 'Starter', status: 'warning', contact: 'info@connectzone.bd', whatsapp: '8801710000013', seed: 141, base: 130 },
  { id: 'speednet', name: 'SpeedNet Online', short: 'SPD', region: 'Tangail', plan: 'Business', status: 'online', contact: 'hello@speednet.bd', whatsapp: '8801710000014', seed: 151, base: 140 },
  { id: 'urbannet', name: 'UrbanNet', short: 'URB', region: 'Dhaka', plan: 'Enterprise', status: 'online', contact: 'noc@urbannet.bd', whatsapp: '8801710000015', seed: 161, base: 150 },
  { id: 'galaxy', name: 'Galaxy ISP', short: 'GLX', region: 'Jashore', plan: 'Business', status: 'online', contact: 'galaxy@isp.bd', whatsapp: '8801710000016', seed: 171, base: 160 },
  { id: 'optica', name: 'Optica Net', short: 'OPT', region: 'Noakhali', plan: 'Starter', status: 'online', contact: 'optica@net.bd', whatsapp: '8801710000017', seed: 181, base: 170 },
  { id: 'megaline', name: 'MegaLine Broadband', short: 'MGL', region: 'Pabna', plan: 'Business', status: 'warning', contact: 'support@megaline.bd', whatsapp: '8801710000018', seed: 191, base: 180 },
  { id: 'cloudnet', name: 'CloudNet BD', short: 'CLD', region: 'Dinajpur', plan: 'Enterprise', status: 'online', contact: 'noc@cloudnet.bd', whatsapp: '8801710000019', seed: 201, base: 190 },
  { id: 'wireline', name: 'WireLine ISP', short: 'WIR', region: 'Faridpur', plan: 'Starter', status: 'online', contact: 'info@wireline.bd', whatsapp: '8801710000020', seed: 211, base: 200 },
]

const DEST_NAMES = ['Google', 'Facebook', 'YouTube', 'Netflix', 'Cloudflare']

export function buildClientData(client) {
  const rnd = seeded(client.seed)
  const prefix = client.short
  const ip = (host) => `10.${client.base}.${host}`

  const deviceTemplates = [
    { name: `${prefix}-CORE-RT-1`, ip: ip('55.1'), category: 'Router', vendor: 'mikrotik', model: 'rb4011', type: 'MikroTik Router' },
    { name: `${prefix}-EDGE-RT-1`, ip: ip('0.1'), category: 'Router', vendor: 'cisco', model: 'isr4331', type: 'Cisco Router' },
    { name: `${prefix}-CORE-SW-1`, ip: ip('55.10'), category: 'Switch', vendor: 'ubiquiti', model: 'uswpro24', type: 'UniFi Switch' },
    { name: `${prefix}-OLT-01`, ip: ip('55.20'), category: 'OLT', vendor: 'huawei', model: 'ma5800', type: 'Huawei OLT' },
    { name: `${prefix}-NVR-01`, ip: ip('55.23'), category: 'NVR', vendor: 'generic', model: 'gen-server', type: 'NVR' },
    { name: `${prefix}-AP-01`, ip: ip('55.30'), category: 'Access Point', vendor: 'ubiquiti', model: 'u6pro', type: 'UniFi AP' },
    { name: `${prefix}-SW-02`, ip: ip('55.11'), category: 'Switch', vendor: 'netgear', model: 'gs724t', type: 'Netgear Switch' },
    { name: `${prefix}-OLT-02`, ip: ip('55.21'), category: 'OLT', vendor: 'zte', model: 'c320', type: 'ZTE OLT' },
  ]
  const deviceCount = 6 + Math.floor(rnd() * 3)
  const devices = deviceTemplates.slice(0, deviceCount).map((d, i) => {
    const cpu = 20 + Math.floor(rnd() * 70)
    const memory = 25 + Math.floor(rnd() * 65)
    let status = 'online'
    if (cpu > 88 || i === 4) status = rnd() > 0.5 ? 'warning' : 'online'
    if (client.status === 'warning' && i === 1) status = 'warning'
    return { id: i + 1, ...d, status, cpu, memory, uptime: `${5 + Math.floor(rnd() * 50)}d ${Math.floor(rnd() * 24)}h`, lastSeen: 'Just now' }
  })

  const cap1 = [300, 500, 700, 1000][Math.floor(rnd() * 4)]
  const cap2 = [150, 200, 300][Math.floor(rnd() * 3)]
  const cur1 = Math.round(cap1 * (0.4 + rnd() * 0.4))
  const cur2 = Math.round(cap2 * (0.3 + rnd() * 0.4))
  const links = [
    { id: 'primary', name: `${prefix} Primary ISP`, capacity: cap1, current: cur1, peak: Math.round(cap1 * 0.9), utilization: Math.round((cur1 / cap1) * 100), availability: 99.9, latency: 8 + Math.floor(rnd() * 12), loss: Math.round(rnd() * 3) / 10, status: 'Healthy' },
    { id: 'backup', name: `${prefix} Backup ISP`, capacity: cap2, current: cur2, peak: Math.round(cap2 * 0.85), utilization: Math.round((cur2 / cap2) * 100), availability: 99.7, latency: 15 + Math.floor(rnd() * 15), loss: Math.round(rnd() * 5) / 10, status: 'Healthy' },
  ]

  const total = 100 + Math.floor(rnd() * 400)
  const active = Math.round(total * (0.4 + rnd() * 0.3))
  const pppStats = {
    total,
    active,
    offline: total - active,
    suspicious: Math.floor(rnd() * 5),
    flapping: Math.floor(rnd() * 4),
    highUsage: 3 + Math.floor(rnd() * 8),
  }

  const pppUsers = Array.from({ length: 8 }, (_, i) => {
    const st = i === 2 ? 'flapping' : i === 5 ? 'offline' : i === 6 ? 'high' : i === 4 ? 'suspicious' : 'online'
    return {
      username: `${client.id}${String(i + 1).padStart(3, '0')}`,
      ip: `10.10.${client.base}.${20 + i}`,
      mac: `AA:BB:${prefix.slice(0, 2).toUpperCase()}:${String(10 + i)}:EE:0${i + 1}`,
      uptime: st === 'offline' ? '—' : `${Math.floor(rnd() * 48)}h ${Math.floor(rnd() * 60)}m`,
      download: st === 'offline' ? 0 : 5 + Math.floor(rnd() * 200),
      upload: st === 'offline' ? 0 : 2 + Math.floor(rnd() * 70),
      status: st,
    }
  })

  const destinations = [
    { name: 'Google DNS', host: '8.8.8.8', latency: 10 + Math.floor(rnd() * 8), loss: 0, availability: 99.99, status: 'online', lastCheck: '10s ago' },
    { name: 'Cloudflare DNS', host: '1.1.1.1', latency: 8 + Math.floor(rnd() * 8), loss: 0, availability: 99.99, status: 'online', lastCheck: '10s ago' },
    { name: 'Facebook', host: 'facebook.com', latency: 20 + Math.floor(rnd() * 20), loss: Math.round(rnd() * 5) / 10, availability: 99.8, status: 'online', lastCheck: '12s ago' },
    { name: 'YouTube', host: 'youtube.com', latency: 25 + Math.floor(rnd() * 25), loss: Math.round(rnd() * 5) / 10, availability: 99.9, status: 'online', lastCheck: '14s ago' },
    { name: 'Netflix', host: 'netflix.com', latency: 40 + Math.floor(rnd() * 40), loss: Math.round(rnd() * 25) / 10, availability: 98.5 + rnd(), status: rnd() > 0.6 ? 'warning' : 'online', lastCheck: '18s ago' },
  ]

  const alerts = [
    { id: `${client.id}-1`, title: 'High bandwidth utilization', severity: 'warning', device: devices[0].name, time: '10:42 AM', status: 'open', description: 'Interface utilization above 85% for 10 minutes.' },
    { id: `${client.id}-2`, title: 'PPPoE session flapping', severity: 'medium', device: devices[1].name, time: '10:15 AM', status: 'open', description: 'Session dropped/reconnected 4 times in 5 minutes.' },
    { id: `${client.id}-3`, title: 'High latency detected', severity: 'warning', device: 'Google DNS', time: '09:58 AM', status: 'acknowledged', description: 'Round-trip latency exceeded threshold.' },
  ]
  if (client.status === 'warning') {
    alerts.unshift({ id: `${client.id}-0`, title: 'High CPU utilization', severity: 'critical', device: devices[0].name, time: '09:40 AM', status: 'open', description: 'CPU sustained above 90% for 3 minutes.' })
  }

  let acc = 0
  const topDestinations = DEST_NAMES.map((n, i) => {
    const pct = i === DEST_NAMES.length - 1 ? Math.max(4, 100 - acc) : Math.round(12 + rnd() * 26)
    acc += pct
    return { name: n, pct, status: rnd() > 0.7 ? 'warning' : 'online', color: '#2563eb' }
  })

  const topology = {
    nodes: [
      { id: 'internet', label: 'Internet', ip: '—', status: 'online', tier: 0 },
      { id: 'isp', label: `${prefix} Upstream ISP`, ip: `103.${client.base}.0.1`, status: 'online', tier: 1 },
      { id: 'core', label: `${prefix}-CORE-RT-1`, ip: ip('55.1'), status: 'online', tier: 2, category: 'Router', vendor: 'mikrotik', model: 'rb4011' },
      { id: 'fw', label: `${prefix}-FIREWALL`, ip: ip('55.2'), status: 'online', tier: 3, category: 'Firewall', vendor: 'cisco', model: 'isr4331' },
      { id: 'sw', label: `${prefix}-CORE-SW-1`, ip: ip('55.10'), status: 'online', tier: 4, category: 'Switch', vendor: 'ubiquiti', model: 'uswpro24' },
      { id: 'olt', label: `${prefix}-OLT-01`, ip: ip('55.20'), status: 'online', tier: 5, category: 'OLT', vendor: 'huawei', model: 'ma5800' },
      { id: 'servers', label: `${prefix}-SERVERS`, ip: ip('55.40'), status: 'online', tier: 5, category: 'Server', vendor: 'generic', model: 'gen-server' },
      { id: 'ap', label: `${prefix}-AP-01`, ip: ip('55.30'), status: 'warning', tier: 5, category: 'Access Point', vendor: 'ubiquiti', model: 'u6pro' },
      { id: 'fttx', label: `${prefix} FTTx Users`, ip: '—', status: 'online', tier: 6 },
      { id: 'pppoe', label: `${prefix} PPPoE Users`, ip: `10.10.${client.base}.0/24`, status: 'online', tier: 6 },
    ],
    edges: [['internet', 'isp'], ['isp', 'core'], ['core', 'fw'], ['fw', 'sw'], ['sw', 'olt'], ['sw', 'servers'], ['sw', 'ap'], ['olt', 'fttx']],
  }

  const totalCap = cap1 + cap2
  const totalCur = cur1 + cur2

  return {
    kpis: {
      onlineDevices: devices.filter((d) => d.status !== 'offline').length,
      totalBandwidth: totalCur,
      activeAlerts: alerts.filter((a) => a.status !== 'resolved').length,
      pppoe: { active, total },
    },
    linkUtilization: { used: Math.round((totalCur / totalCap) * 100), available: 100 - Math.round((totalCur / totalCap) * 100), current: totalCur, capacity: totalCap },
    topDestinations,
    devices,
    pppStats,
    pppUsers,
    links,
    destinations,
    alerts,
    topology,
  }
}

export function getClient(id) {
  return CLIENTS.find((c) => c.id === id) || CLIENTS[0]
}
