import { useEffect, useRef, useState } from 'react'
import { devices as seedDevices } from '../data/mockData'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const rand = (min, max) => Math.random() * (max - min) + min
const randInt = (min, max) => Math.round(rand(min, max))

/**
 * Simulated real-time monitoring snapshot.
 * Swap this hook's body for a WebSocket/SSE feed later — the shape stays the same.
 */
export function useLive(intervalMs = 3000, seed = null, resetKey = 'default') {
  const init = () => ({
    bandwidth: seed?.bandwidth ?? 620,
    pppoeActive: seed?.pppoeActive ?? 109,
    latency: seed?.latency ?? 12,
    cpu: seed?.cpu ?? 42,
    lastUpdate: new Date(),
  })
  const [state, setState] = useState(init)

  // reset when the active client changes
  useEffect(() => {
    setState(init())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => ({
        bandwidth: clamp(s.bandwidth + rand(-28, 32), 360, 760),
        pppoeActive: clamp(s.pppoeActive + randInt(-2, 2), 96, 220),
        latency: clamp(s.latency + rand(-3, 3), 8, 40),
        cpu: clamp(s.cpu + rand(-6, 7), 24, 96),
        lastUpdate: new Date(),
      }))
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return state
}

/** Live-jittered device list for a given client's devices. */
export function useLiveDevices(seed = seedDevices, intervalMs = 4000) {
  const [list, setList] = useState(seed)

  // reset when the active client's device set changes
  useEffect(() => {
    setList(seed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed])

  useEffect(() => {
    const id = setInterval(() => {
      setList((prev) =>
        prev.map((d) => {
          const cpu = clamp(d.cpu + randInt(-7, 7), 8, 99)
          const memory = clamp(d.memory + randInt(-4, 4), 10, 99)
          let status = d.status
          if (d.status !== 'offline') status = cpu > 88 ? 'warning' : 'online'
          return { ...d, cpu, memory, status, lastSeen: 'Just now' }
        })
      )
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return list
}

/** A monotonically increasing counter, useful to trigger re-renders for charts. */
export function useTick(intervalMs = 3000) {
  const [tick, setTick] = useState(0)
  const ref = useRef(0)
  useEffect(() => {
    const id = setInterval(() => {
      ref.current += 1
      setTick(ref.current)
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return tick
}
