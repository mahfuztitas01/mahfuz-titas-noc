import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CLIENTS, buildClientData, getClient } from '../data/clients'
import { useAuth } from './AuthContext'

const CLIENT_KEY = 'mtnoc_client'
const CONTACTS_KEY = 'mtnoc_client_contacts'
const DEVICES_KEY = 'mtnoc_devices'
const TOPOLOGY_KEY = 'mtnoc_topology'

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

  const effectiveId = lockedClientId || selectedId
  const applyOverride = (c) => ({ ...c, ...(overrides[c.id] || {}) })

  const clients = useMemo(() => CLIENTS.map(applyOverride), [overrides])
  const client = useMemo(() => applyOverride(getClient(effectiveId)), [effectiveId, overrides])
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
  }
  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
}

export function useClient() {
  const ctx = useContext(ClientContext)
  if (!ctx) throw new Error('useClient must be used within ClientProvider')
  return ctx
}
