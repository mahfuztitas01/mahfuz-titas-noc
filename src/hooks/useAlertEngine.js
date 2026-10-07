import { useEffect, useRef, useState } from 'react'
import { alertsSeed } from '../data/mockData'
import { dispatchAlert } from '../services/notifications'

// Threshold rules — when a live metric crosses a threshold, an alert is raised.
// Replace `live` with real API/WebSocket metrics later; the shape stays the same.
const RULES = [
  { id: 'bw', metric: 'bandwidth', threshold: 700, severity: 'warning', device: 'CORE-RT-1', title: 'High bandwidth utilization', desc: 'Total bandwidth exceeded 700 Mbps.' },
  { id: 'lat', metric: 'latency', threshold: 28, severity: 'critical', device: 'Google DNS', title: 'High latency detected', desc: 'Latency to Google DNS exceeded 28 ms.' },
  { id: 'cpu', metric: 'cpu', threshold: 90, severity: 'critical', device: 'CORE-RT-1', title: 'High CPU utilization', desc: 'Core router CPU sustained above 90%.' },
  { id: 'ppp', metric: 'pppoeActive', threshold: 128, severity: 'warning', device: 'EDGE-RT-1', title: 'PPPoE session surge', desc: 'Active PPPoE sessions exceeded 128.' },
]

const COOLDOWN_MS = 15000

/**
 * @param live        live metric object { bandwidth, latency, cpu, pppoeActive }
 * @param seedAlerts  starting alerts (per client)
 * @param resetKey    when this changes (e.g. client id), alert state resets
 */
export function useAlertEngine(live, seedAlerts = alertsSeed, resetKey = 'default', clientMeta = {}) {
  const [alerts, setAlerts] = useState(seedAlerts)
  const firingRef = useRef(new Set())
  const cooldownRef = useRef({})

  // Reset when the active client (tenant) changes.
  useEffect(() => {
    setAlerts(seedAlerts)
    firingRef.current = new Set()
    cooldownRef.current = {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  useEffect(() => {
    const now = Date.now()
    RULES.forEach((rule) => {
      const value = live[rule.metric]
      const isFiring = value > rule.threshold
      const wasFiring = firingRef.current.has(rule.id)

      if (isFiring && !wasFiring) {
        const last = cooldownRef.current[rule.id] || 0
        if (now - last > COOLDOWN_MS) {
          cooldownRef.current[rule.id] = now
          firingRef.current.add(rule.id)
          const newAlert = {
            id: `${rule.id}-${now}`,
            title: rule.title,
            severity: rule.severity,
            device: rule.device,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'open',
            description: `${rule.desc} (current: ${Math.round(value)})`,
            fresh: true,
          }
          setAlerts((prev) => [newAlert, ...prev])
          // Forward to backend webhook (WhatsApp / Telegram / email) if configured.
          // Includes the active client so the backend can route to that client's number.
          dispatchAlert(newAlert, clientMeta)
        }
      } else if (!isFiring && wasFiring) {
        firingRef.current.delete(rule.id)
      }
    })
  }, [live, clientMeta])

  const setStatus = (id, status) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status, fresh: false } : a)))

  const clearFresh = (id) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, fresh: false } : a)))

  return { alerts, setStatus, clearFresh }
}
