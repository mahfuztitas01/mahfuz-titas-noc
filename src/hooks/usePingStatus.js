import { useEffect, useState } from 'react'
import { pingHosts, isBackendConfigured } from '../services/api'

/**
 * Pings the given devices' IPs from the backend and returns a status map
 * (id -> 'online' | 'offline'). Falls back gracefully if the backend is down.
 */
export function usePingStatus(devices, intervalMs = 15000) {
  const [status, setStatus] = useState({})
  const [reachable, setReachable] = useState(true)
  const [checking, setChecking] = useState(false)
  const [configured, setConfigured] = useState(isBackendConfigured())

  const ipsKey = (devices || []).map((d) => `${d.id}:${d.ip}`).join(',')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const list = (devices || []).filter((d) => d.ip && d.ip !== '—')
      if (list.length === 0) return
      if (!isBackendConfigured()) {
        if (!cancelled) {
          setConfigured(false)
          setReachable(false)
          setChecking(false)
        }
        return
      }
      setChecking(true)
      try {
        const res = await pingHosts(list.map((d) => ({ id: d.id, ip: d.ip })))
        if (cancelled) return
        const map = {}
        ;(res.results || []).forEach((r) => {
          map[r.id] = r.online ? 'online' : 'offline'
        })
        setStatus(map)
        setConfigured(true)
        setReachable(true)
      } catch {
        if (!cancelled) setReachable(false)
      } finally {
        if (!cancelled) setChecking(false)
      }
    }
    run()
    const id = setInterval(run, intervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ipsKey, intervalMs])

  return { status, reachable, checking, configured }
}
