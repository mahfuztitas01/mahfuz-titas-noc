import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CLIENTS, buildClientData } from '../data/clients'
import { useAuth } from './AuthContext'

const CLIENT_KEY = 'mtnoc_client'
const CONTACTS_KEY = 'mtnoc_client_contacts'
const DEVICES_KEY = 'mtnoc_devices'
const TOPOLOGY_KEY = 'mtnoc_topology'
const ADDED_KEY = 'mtnoc_added_clients'
const REMOVED_KEY = 'mtnoc_removed_clients'

const ClientContext = createContext(null)

function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function loadRaw(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    if (v == null) return fallback
    try {
      return JSON.parse(v)
    } catch {
      return v
    }
  } catch {
    return fallback
  }
}

function slugify(s) {
  const out = String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
  return out || `isp-${Date.now().toString(36)}`
}

export function ClientProvider({ children }) {
  const { currentUser } = useAuth()
  // Client users are locked to their own client.
  const lockedClientId = currentUser?.isClient ? currentUser.clientId : null

  const [selectedId, setSelectedId] = useState(() => loadRaw(CLIENT_KEY, CLIENTS[0].id))
  const [overrides, setOverrides] = useState(() => loadJSON(CONTACTS_KEY, {}))
  // Per-client device lists (persisted so add/edit/delete survive navigation & reload).
  const [deviceStore, setDeviceStore] = useState(() => loadJSON(DEVICES_KEY, {}))
  // Per-client network map (custom topology) — each client can be arranged freely.
  const [topologyStore, setTopologyStore] = useState(() => loadJSON(TOPOLOGY_KEY, {}))
  // User-created clients + clients the user deleted (persisted).
  const [added, setAdded] = useState(() => loadJSON(ADDED_KEY, []))
  const [removed, setRemoved] = useState(() => loadJSON(REMOVED_KEY, []))

  useEffect(() => {
    try {
      localStorage.setItem(CLIENT_KEY, JSON.stringify(selectedId))
    } catch {
      /* ignore */
    }
  }, [selectedId])

  useEffect(() => {
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(overrides))
    } catch {
      /* ignore */
    }
  }, [overrides])

  useEffect(() => {
    try {
      localStorage.setItem(DEVICES_KEY, JSON.stringify(deviceStore))
    } catch {
      /* ignore */
    }
  }, [deviceStore])

  useEffect(() => {
    try {
      localStorage.setItem(TOPOLOGY_KEY, JSON.stringify(topologyStore))
    } catch {
      /* ignore */
    }
  }, [topologyStore])

  useEffect(() => {
    try {
      localStorage.setItem(ADDED_KEY, JSON.stringify(added))
    } catch {
      /* ignore */
    }
  }, [added])

  useEffect(() => {
    try {
      localStorage.setItem(REMOVED_KEY, JSON.stringify(removed))
    } catch {
      /* ignore */
    }
  }, [removed])

  // Full client list: built-ins (minus removed) + user-added (minus removed).
  const allClients = useMemo(() => {
    const base = CLIENTS.filter((c) => !removed.includes(c.id))
    const extra = added.filter((c) => !removed.includes(c.id))
    return [...base, ...extra]
  }, [added, removed])

  const effectiveId = lockedClientId || selectedId
  const applyOverride = (c) => ({ ...c, ...(overrides[c.id] || {}) })

  const clients = useMemo(() => allClients.map(applyOverride), [allClients, overrides])
  const client = useMemo(() => {
    const found = allClients.find((c) => c.id === effectiveId)
    return applyOverride(found || allClients[0] || CLIENTS[0])
  }, [allClients, effectiveId, overrides])

  const data = useMemo(() => {
    const base = buildClientData(client)
    if (deviceStore[client.id]) base.devices = deviceStore[client.id]
    if (topologyStore[client.id]) base.topology = topologyStore[client.id]
    return base
  }, [client, deviceStore, topologyStore])

  const setClientId = (id) => {
    if (!lockedClientId) setSelectedId(id)
  }
  const updateContact = (id, patch) =>
    setOverrides((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }))

  const addClient = (data) => {
    const usedIds = new Set([...CLIENTS.map((c) => c.id), ...added.map((c) => c.id)])
    let id = slugify(data.name)
    let n = 2
    while (usedIds.has(id)) id = `${slugify(data.name)}-${n++}`

    const usedBases = new Set([...CLIENTS.map((c) => c.base), ...added.map((c) => c.base)])
    let base = 210
    while (usedBases.has(base)) base += 10

    const letters = String(data.name || '').replace(/[^A-Za-z]/g, '').toUpperCase()
    const newClient = {
      id,
      name: data.name.trim(),
      short: (data.short || letters.slice(0, 3) || 'ISP').toUpperCase(),
      region: (data.region || '').trim() || '—',
      plan: data.plan || 'Business',
      status: 'online',
      contact: (data.contact || '').trim(),
      whatsapp: '',
      seed: Math.floor(Math.random() * 200) + 5,
      base,
      added: true,
    }
    setAdded((prev) => [...prev, newClient])
    return newClient
  }

  const removeClient = (id) => {
    setRemoved((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setAdded((prev) => prev.filter((c) => c.id !== id))
    setSelectedId((cur) => (cur === id ? CLIENTS.find((c) => c.id !== id)?.id || CLIENTS[0].id : cur))
  }

  const saveDevices = (id, devices) => setDeviceStore((prev) => ({ ...prev, [id]: devices }))
  const saveTopology = (id, topology) => setTopologyStore((prev) => ({ ...prev, [id]: topology }))

  const value = {
    client,
    clients,
    clientId: effectiveId,
    setClientId,
    data,
    updateContact,
    saveDevices,
    saveTopology,
    locked: !!lockedClientId,
    addClient,
    removeClient,
  }
  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
}

export function useClient() {
  const ctx = useContext(ClientContext)
  if (!ctx) throw new Error('useClient must be used within ClientProvider')
  return ctx
}
