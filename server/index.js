import express from 'express'
import cors from 'cors'
import { exec } from 'node:child_process'
import 'dotenv/config'

const app = express()
app.use(cors())
app.use(express.json())

const {
  PORT = 4000,
  WHATSAPP_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_API_VERSION = 'v21.0',
  // The "engineer group": WhatsApp Cloud API cannot post to a real group, so we
  // broadcast to every engineer number (acts like a group).
  ENGINEER_NUMBERS = '',
  // Optional server-side routing table: {"rahim":"8801710000001","karim":"..."}
  CLIENT_ROUTES = '{}',
  // Fallback recipient if nothing else resolves
  WHATSAPP_TO = '',
} = process.env

let clientRoutes = {}
try {
  clientRoutes = JSON.parse(CLIENT_ROUTES)
} catch {
  console.warn('[warn] CLIENT_ROUTES is not valid JSON — ignoring')
}

const configured = Boolean(WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID)
const splitNums = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean)
const mask = (n) => (n && n.length > 6 ? `${n.slice(0, 4)}•••${n.slice(-3)}` : n)

function severityEmoji(sev) {
  const s = String(sev || '').toLowerCase()
  if (s === 'critical' || s === 'high') return '🔴'
  if (s === 'warning' || s === 'medium') return '🟠'
  return '🔵'
}

function buildMessage(client = {}, alert = {}) {
  const clientLine = client.name ? `Client: *${client.name}*${client.short ? ` (${client.short})` : ''}\n` : ''
  return (
    `${severityEmoji(alert.severity)} *MAHFUZ TITAS NOC — ${String(alert.severity || 'alert').toUpperCase()}*\n\n` +
    clientLine +
    `*${alert.title || 'Network alert'}*\n` +
    `Device: ${alert.device || '-'}\n` +
    `Time: ${alert.time || '-'}\n` +
    `Status: ${alert.status || '-'}\n` +
    `Details: ${alert.description || '-'}`
  )
}

/** Resolve who receives this alert: the CLIENT'S WhatsApp group (+ optional global NOC numbers). */
function resolveRecipients(client = {}) {
  // Client "group" = one or more numbers (client team + NOC engineers). Comma-separated allowed.
  const clientGroup = (client.id && clientRoutes[client.id]) || client.whatsapp || ''
  const recipients = new Set([
    ...splitNums(clientGroup),
    ...splitNums(ENGINEER_NUMBERS), // optional global NOC group
    ...splitNums(WHATSAPP_TO),
  ].filter(Boolean))
  return { recipients: [...recipients], engineers: splitNums(ENGINEER_NUMBERS), clientGroup }
}

async function sendWhatsApp(to, text) {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`
  const payload = { messaging_product: 'whatsapp', to, type: 'text', text: { body: text, preview_url: false } }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) console.error('[whatsapp] send failed', res.status, JSON.stringify(data))
    return { to: mask(to), ok: res.ok, status: res.status }
  } catch (err) {
    console.error('[whatsapp] error', err)
    return { to: mask(to), ok: false, error: String(err) }
  }
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'Mahfuz Titas NOC — WhatsApp Bridge', whatsappConfigured: configured })
})

// ---------------------------------------------------------------------------
// Real reachability check — pings device IPs from THIS machine and returns
// online/offline. This is what makes devices show offline when unreachable.
// Only private ranges are allowed (10/8, 172.16/12, 192.168/16).
// ---------------------------------------------------------------------------
function isPrivateIp(ip) {
  const v = String(ip || '').trim()
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(v)) return false
  const [a, b] = v.split('.').map(Number)
  if (a === 127) return true
  if (a === 10) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  return false
}

function pingHost(ip) {
  return new Promise((resolve) => {
    if (!isPrivateIp(ip)) return resolve({ ip, online: false, reason: 'not a private IP' })
    const isWin = process.platform === 'win32'
    const cmd = isWin ? `ping -n 1 -w 1200 ${ip}` : `ping -c 1 -W 1 ${ip}`
    const started = Date.now()
    exec(cmd, { timeout: 4000, windowsHide: true }, (err, stdout) => {
      const latency = Date.now() - started
      const ok = !err && /Reply from|bytes=|1 received|1 packets received|ttl=/i.test(stdout || '')
      resolve({ ip, online: ok, latency: ok ? latency : null })
    })
  })
}

app.post('/api/ping', async (req, res) => {
  const hosts = Array.isArray(req.body?.hosts) ? req.body.hosts.slice(0, 100) : []
  const results = await Promise.all(
    hosts.map(async (h) => ({ id: h.id, ...(await pingHost(h.ip)) }))
  )
  res.json({ ok: true, results })
})

app.get('/config', (_req, res) => {
  const engineers = splitNums(ENGINEER_NUMBERS)
  res.json({
    whatsappConfigured: configured,
    engineerGroup: engineers.map(mask),
    clientRoutes: Object.fromEntries(Object.entries(clientRoutes).map(([k, v]) => [k, mask(v)])),
  })
})

// NOC app posts threshold alerts here (includes the active client).
app.post('/alerts', async (req, res) => {
  const alert = req.body?.alert || req.body || {}
  const client = req.body?.client || {}
  const text = buildMessage(client, alert)
  const { recipients, engineers, clientGroup } = resolveRecipients(client)

  console.log(`[alert] ${alert.severity || '?'} | ${client.name || 'no-client'} | ${alert.title || '?'} -> ${recipients.length} group recipient(s)`)

  if (!configured) {
    console.warn('[warn] WhatsApp not configured — logging only')
    return res.json({ ok: true, delivered: false, reason: 'WhatsApp not configured', recipients: recipients.map(mask), preview: text })
  }

  const results = []
  for (const to of recipients) results.push(await sendWhatsApp(to, text))

  res.json({
    ok: true,
    delivered: results.some((r) => r.ok),
    globalNocGroup: engineers.map(mask),
    clientGroup: splitNums(clientGroup).map(mask),
    results,
  })
})

app.listen(PORT, () => {
  console.log(`Mahfuz Titas NOC — WhatsApp bridge listening on http://localhost:${PORT}`)
  console.log(configured ? 'WhatsApp: configured ✅' : 'WhatsApp: NOT configured (set .env) — will log only')
  console.log(`Engineer group: ${splitNums(ENGINEER_NUMBERS).length} number(s)`)
})
