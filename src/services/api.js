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

// Real backend base URL (optional ping service).
// When nothing is configured the app runs fully on simulated demo data and
// never contacts a backend, so no failed network requests appear in the
// browser console ("backend offline" leftovers are gone).
export function isBackendConfigured() {
  try {
    const v = localStorage.getItem('mtnoc_backend')
    if (v && v.trim()) return true
  } catch {
    /* ignore */
  }
  return Boolean(import.meta.env.VITE_BACKEND_URL)
}

// Resolved at runtime: Settings value (localStorage) → build env.
export function getBackendUrl() {
  try {
    const v = localStorage.getItem('mtnoc_backend')
    if (v && v.trim()) return v.trim().replace(/\/$/, '')
  } catch {
    /* ignore */
  }
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
}

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

// Ping a list of device hosts from the backend; returns per-host online/offline.
// If no backend is configured this resolves immediately WITHOUT any network
// request, keeping the dashboard error-free in demo mode.
export async function pingHosts(hosts) {
  if (!isBackendConfigured()) return { configured: false, results: [] }
  const res = await fetch(`${getBackendUrl()}/api/ping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hosts }),
  })
  if (!res.ok) throw new Error(`ping failed: ${res.status}`)
  const data = await res.json()
  return { configured: true, results: data.results || [] }
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
