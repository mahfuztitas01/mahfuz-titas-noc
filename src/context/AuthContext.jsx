import { createContext, useContext, useEffect, useState } from 'react'
import { CLIENTS } from '../data/clients'

// ---------------------------------------------------------------------------
// Mock authentication (frontend demo).
// Team users have full access. Client users are scoped to ONE client (clientId)
// and can only monitor that ISP.
// NOTE: passwords are stored in localStorage for DEMO only — a real backend must
// hash them and scope every API response by the user's clientId.
// ---------------------------------------------------------------------------

const USERS_KEY = 'mtnoc_users_v2'
// Only "Remember me" sessions are persisted (localStorage). A normal sign-in
// lives in memory only, so opening/pasting the site link always shows Login.
const SESSION_KEY = 'mtnoc_session_v3'
const LEGACY_SESSION_KEY = 'mtnoc_session_v2'

const TEAM_USERS = [
  { id: 1, name: 'Mahfuz Titas', username: 'mahfuz', email: 'mahfuz@noc.local', role: 'Super Admin', status: 'active', password: 'admin123', clientId: null, lastLogin: 'Today, 09:12' },
  { id: 2, name: 'Rahat Hossain', username: 'rahat', email: 'rahat@noc.local', role: 'NOC Engineer', status: 'active', password: 'rahat123', clientId: null, lastLogin: 'Today, 08:40' },
  { id: 3, name: 'Sadia Islam', username: 'sadia', email: 'sadia@noc.local', role: 'Support Engineer', status: 'active', password: 'sadia123', clientId: null, lastLogin: 'Yesterday, 18:22' },
  { id: 4, name: 'Arif Khan', username: 'arif', email: 'arif@noc.local', role: 'Viewer', status: 'disabled', password: 'arif123', clientId: null, lastLogin: '12 Sep, 11:05' },
]

// One user per client — scoped to that client only.
const CLIENT_USERS = CLIENTS.map((c, i) => ({
  id: 1000 + i,
  name: `${c.name}`,
  username: c.id,
  email: c.contact,
  role: 'Client',
  status: 'active',
  password: `${c.id}123`,
  clientId: c.id,
  lastLogin: 'Never',
}))

const SEED_USERS = [...TEAM_USERS, ...CLIENT_USERS]

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => load(USERS_KEY, SEED_USERS))
  const [currentUser, setCurrentUser] = useState(() => load(SESSION_KEY, null))
  const [remember, setRemember] = useState(() => Boolean(load(SESSION_KEY, null)))

  // Clear the old always-persistent session so visitors land on the Login page.
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_SESSION_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    } catch {
      /* ignore */
    }
  }, [users])

  useEffect(() => {
    try {
      if (currentUser && remember) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser))
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
  }, [currentUser, remember])

  const login = (username, password, rememberMe = false) => {
    const key = String(username || '').trim().toLowerCase()
    const user = users.find((u) => u.username.toLowerCase() === key || (u.email || '').toLowerCase() === key)
    if (!user) return { ok: false, error: 'No account found for that username/email' }
    if (user.status === 'disabled') return { ok: false, error: 'This account is disabled' }
    if (user.password !== password) return { ok: false, error: 'Incorrect password' }
    const session = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      clientId: user.clientId || null,
      isClient: user.role === 'Client' && !!user.clientId,
    }
    setRemember(Boolean(rememberMe))
    setCurrentUser(session)
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, lastLogin: 'Just now' } : u)))
    return { ok: true, user: session }
  }

  const logout = () => {
    setRemember(false)
    setCurrentUser(null)
  }

  const addUser = (data) => setUsers((prev) => [...prev, { ...data, id: Date.now(), lastLogin: 'Never' }])
  const updateUser = (id, patch) => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  const removeUser = (id) => setUsers((prev) => prev.filter((u) => u.id !== id))

  const value = { users, currentUser, login, logout, addUser, updateUser, removeUser }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
