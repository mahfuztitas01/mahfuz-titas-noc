// ---------------------------------------------------------------------------
// API service layer.
//
// This app currently runs on MOCK data. Every function here is the single
// place a real backend/WebSocket will plug into later. Swap the bodies for
// `fetch('/api/...')` calls and the UI keeps working unchanged.
// ---------------------------------------------------------------------------
import * as mock from '../data/mockData'

const LATENCY = 250
const delay = (ms) => new Promise((r) => setTimeout(r, ms))

const respond = async (data) => {
  await delay(LATENCY)
  return JSON.parse(JSON.stringify(data))
}

export const api = {
  getKpis: () => respond(mock.kpis),
  getSystemStatus: () => respond(mock.systemStatus),
  getTraffic: (range) => respond(mock.generateTraffic(range)),
  getLinkUtilization: () => respond(mock.linkUtilization),
  getTopDestinations: () => respond(mock.topDestinations),
  getDevices: () => respond(mock.devices),
  getPppStats: () => respond(mock.pppStats),
  getPppUsers: () => respond(mock.pppUsers),
  getLinks: () => respond(mock.links),
  getDestinations: () => respond(mock.destinations),
  getAlerts: () => respond(mock.alertsSeed),
  getNotifications: () => respond(mock.notificationsSeed),
  getUsers: () => respond(mock.users),
  getRoles: () => respond(mock.roles),
  getReports: () => respond(mock.reports),
  getTopology: () => respond(mock.topology),
}

// Real backend base URL (the WhatsApp bridge + ping service).
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

// Ping a list of device hosts from the backend; returns per-host online/offline.
export async function pingHosts(hosts) {
  const res = await fetch(`${BACKEND_URL}/api/ping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hosts }),
  })
  if (!res.ok) throw new Error(`ping failed: ${res.status}`)
  return res.json()
}

// Real WebSocket helper (unused until backend exists).
export function connectLiveFeed(onMessage, url = '/ws/noc') {
  try {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${proto}://${window.location.host}${url}`)
    ws.onmessage = (e) => onMessage(JSON.parse(e.data))
    return () => ws.close()
  } catch {
    return () => {}
  }
}

export default api
