// ---------------------------------------------------------------------------
// Mahfuz Titas NOC — WhatsApp BOT ("mahfuztitasaiagent") gateway (Baileys).
//
// You only paste your WhatsApp GROUP LINK here → the bot joins that group and
// forwards every NMS alert to it.
//
// NOTE: unofficial (WhatsApp Web multi-device). Use a dedicated number for the
// bot. Small ban risk — internal use recommended.
//
//   1) cd server && npm install
//   2) node baileys-bridge.js           → scan the QR (Linked devices)
//   3) In the NOC app → Settings → Notifications → paste the group link → Connect
//      (or POST {link} to http://localhost:4001/join)
//   4) NOC webhook URL = http://localhost:4001/alerts
// ---------------------------------------------------------------------------
import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import 'dotenv/config'

const PORT = process.env.PORT || process.env.BAILEYS_PORT || 4001
const GROUP_FILE = 'baileys_group.json' // remembers the joined group
const BOT_NAME = process.env.BOT_NAME || 'mahfuztitasaiagent'

const app = express()
app.use(cors())
app.use(express.json())

let sock = null
let ready = false
let groups = {}
let target = null // { jid, name }

try {
  if (fs.existsSync(GROUP_FILE)) target = JSON.parse(fs.readFileSync(GROUP_FILE, 'utf8'))
} catch {
  /* ignore */
}

function saveTarget(t) {
  target = t
  try {
    fs.writeFileSync(GROUP_FILE, JSON.stringify(t, null, 2))
  } catch {
    /* ignore */
  }
}

function inviteCode(link) {
  const m = String(link || '').match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
  return m ? m[1] : String(link || '').trim()
}

function buildMessage(client = {}, alert = {}) {
  const emoji = /critical|high/i.test(alert.severity || '') ? '🔴' : /warning|medium/i.test(alert.severity || '') ? '🟠' : '🔵'
  const clientLine = client.name ? `Client: *${client.name}*\n` : ''
  return (
    `${emoji} *MAHFUZ TITAS NOC — ${String(alert.severity || 'alert').toUpperCase()}*\n\n` +
    clientLine +
    `*${alert.title || 'Network alert'}*\n` +
    `Device: ${alert.device || '-'}\n` +
    `Time: ${alert.time || '-'}\n` +
    `Details: ${alert.description || '-'}`
  )
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth')
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: [BOT_NAME, 'Chrome', '1.0.0'], // shows as this device name
    printQRInTerminal: false,
  })

  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      console.log(`\n=== Scan with WhatsApp (Linked devices) as "${BOT_NAME}" ===\n`)
      qrcode.generate(qr, { small: true })
    }
    if (connection === 'open') {
      ready = true
      console.log(`\n✅ Bot "${BOT_NAME}" connected.`)
      try {
        groups = await sock.groupFetchAllParticipating()
        if (target?.jid && !groups[target.jid]) {
          console.log(`⚠️ Saved group no longer joined: ${target.jid}`)
        }
        console.log(target?.jid ? `→ Target group: ${target.name} (${target.jid})` : '→ No group set yet — paste your group link in the NOC app.')
      } catch (e) {
        console.error('group fetch failed:', e)
      }
    }
    if (connection === 'close') {
      ready = false
      const code = lastDisconnect?.error?.output?.statusCode
      if (code !== DisconnectReason.loggedOut) start()
      else console.log('Logged out — delete ./baileys_auth and re-scan QR.')
    }
  })
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'MT-NOC Baileys bot', bot: BOT_NAME, connected: ready, group: target }))
app.get('/status', (_req, res) => res.json({ connected: ready, bot: BOT_NAME, group: target }))
app.get('/groups', (_req, res) => res.json({ groups: Object.entries(groups).map(([jid, g]) => ({ jid, name: g.subject })) }))

// Paste the group link → the bot joins it and remembers it.
app.post('/join', async (req, res) => {
  const link = req.body?.link || req.body?.groupLink || ''
  if (!ready) return res.status(503).json({ ok: false, reason: 'Bot not connected yet (scan QR first)' })
  const code = inviteCode(link)
  if (!code) return res.status(400).json({ ok: false, reason: 'Invalid group link' })
  try {
    const jid = await sock.groupAcceptInvite(code)
    let name = jid
    try {
      const meta = await sock.groupMetadata(jid)
      name = meta.subject || jid
    } catch {
      /* ignore */
    }
    saveTarget({ jid, name })
    console.log(`[join] bot joined group: ${name} (${jid})`)
    res.json({ ok: true, group: { jid, name } })
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e?.message || e) })
  }
})

app.post('/alerts', async (req, res) => {
  const alert = req.body?.alert || req.body || {}
  const client = req.body?.client || {}
  const text = buildMessage(client, alert)
  const jid = target?.jid
  console.log(`[alert] ${alert.severity || '?'} | ${client.name || '-'} | ${alert.title || '?'} -> ${jid || '(no group)'}`)
  if (!ready) return res.status(503).json({ ok: false, reason: 'Bot not connected' })
  if (!jid) return res.json({ ok: false, reason: 'No group set. Paste your group link in the NOC app.', preview: text })
  try {
    await sock.sendMessage(jid, { text })
    res.json({ ok: true, delivered: true, group: target })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) })
  }
})

app.listen(PORT, () => console.log(`MT-NOC WhatsApp bot "${BOT_NAME}" on http://localhost:${PORT}`))
start()
