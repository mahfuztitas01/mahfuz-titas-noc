import { useEffect, useRef } from 'react'
import { dispatchAlert } from '../services/notifications'

// ---------------------------------------------------------------------------
// Device-down detector.
// When a device's effective status stays "offline" for downMs (default 20s),
// ONE alert is sent (Telegram / webhook). When it comes back, a recovery alert
// is sent. Re-fires only after the device has recovered and gone down again.
//
// Alerts are delivered by dispatchAlert() using the saved notification config
// (Settings -> Notifications): Telegram needs only a bot token + chat id.
// ---------------------------------------------------------------------------
export function useDeviceDownAlerts(devices = [], statusMap = {}, clientMeta = {}, downMs = 20000) {
  const downSince = useRef({}) // id -> first-seen-down timestamp
  const alerted = useRef(new Set()) // ids currently alerted as down
  const ref = useRef({ devices, statusMap, clientMeta })

  // keep the latest inputs without resetting the interval
  useEffect(() => {
    ref.current = { devices, statusMap, clientMeta }
  })

  useEffect(() => {
    const now = () => Date.now()
    const time = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const check = () => {
      const { devices: devs, statusMap: map, clientMeta: meta } = ref.current
      const present = new Set()
      devs.forEach((d) => {
        present.add(String(d.id))
        const st = map[d.id] || d.status
        const isDown = st === 'offline'

        if (isDown) {
          if (!downSince.current[d.id]) downSince.current[d.id] = now()
          const dur = now() - downSince.current[d.id]
          if (dur >= downMs && !alerted.current.has(d.id)) {
            alerted.current.add(d.id)
            dispatchAlert(
              {
                id: `down-${d.id}-${now()}`,
                title: `Device DOWN — ${d.name}`,
                severity: 'critical',
                device: d.name,
                time: time(),
                status: 'open',
                description: `${d.name} (${d.ip || 'no IP'}) unreachable for ${Math.round(downMs / 1000)}+ seconds.`,
              },
              meta
            )
          }
        } else {
          if (alerted.current.has(d.id)) {
            alerted.current.delete(d.id)
            dispatchAlert(
              {
                id: `up-${d.id}-${now()}`,
                title: `Device RECOVERED — ${d.name}`,
                severity: 'info',
                device: d.name,
                time: time(),
                status: 'resolved',
                description: `${d.name} (${d.ip || 'no IP'}) is reachable again.`,
              },
              meta
            )
          }
          delete downSince.current[d.id]
        }
      })

      Object.keys(downSince.current).forEach((id) => {
        if (!present.has(String(id))) delete downSince.current[id]
      })
    }

    const id = setInterval(check, 4000)
    return () => clearInterval(id)
  }, [downMs])
}
