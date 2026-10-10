// ---------------------------------------------------------------------------
// Outbound notification dispatcher.
// Reads notification settings from localStorage and forwards alerts to:
//   • Telegram Bot API  (directly from the browser — no backend needed)
//   • a backend webhook (WhatsApp Cloud API / Baileys / email / etc.)
//
// Telegram works straight from the HTTPS site: api.telegram.org is HTTPS and
// allows browser CORS, so NO server / VM / PC is required for Telegram alerts.
// ---------------------------------------------------------------------------

const KEY = 'mtnoc_notify'

export function getNotifyConfig() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveNotifyConfig(cfg) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg))
  } catch {
    /* ignore */
  }
}

function sevEmoji(sev) {
  const s = String(sev || '').toLowerCase()
  if (/critical|high/.test(s)) return '🔴'
  if (/warning|medium/.test(s)) return '🟠'
  return '🔵'
}

export function buildAlertText(alert = {}, clientMeta = {}) {
  const lines = [`${sevEmoji(alert.severity)} MAHFUZ TITAS NOC — ${String(alert.severity || 'alert').toUpperCase()}`, '']
  if (clientMeta.name) lines.push(`Client: ${clientMeta.name}`)
  lines.push(`${alert.title || 'Network alert'}`)
  if (alert.device) lines.push(`Device: ${alert.device}`)
  if (alert.time) lines.push(`Time: ${alert.time}`)
  if (alert.description) lines.push(`Details: ${alert.description}`)
  return lines.join('\n')
}

export function telegramConfigured(cfg = getNotifyConfig()) {
  return Boolean((cfg.telegramToken || '').trim() && (cfg.telegramChatId || '').trim())
}

// Send one message straight to Telegram via the Bot API (browser → HTTPS).
export async function sendTelegram(token, chatId, alert, clientMeta = {}) {
  const text = buildAlertText(alert, clientMeta)
  const res = await fetch(`https://api.telegram.org/bot${String(token).trim()}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: String(chatId).trim(), text, disable_web_page_preview: true }),
  })
  let data = {}
  try {
    data = await res.json()
  } catch {
    /* ignore */
  }
  if (!res.ok || data.ok === false) {
    throw new Error(data.description || `Telegram request failed (${res.status})`)
  }
  return data
}

function buildPayload(alert, clientMeta) {
  return {
    app: 'Mahfuz Titas NOC',
    source: 'NOC Web',
    sentAt: new Date().toISOString(),
    client: {
      id: clientMeta.id || null,
      name: clientMeta.name || null,
      short: clientMeta.short || null,
      whatsapp: clientMeta.whatsapp || null,
    },
    alert: {
      id: alert.id,
      title: alert.title,
      severity: alert.severity,
      device: alert.device,
      time: alert.time,
      status: alert.status,
      description: alert.description,
    },
  }
}

// Dispatch an alert to every configured channel. Runs all channels in parallel.
export async function dispatchAlert(alert, clientMeta = {}) {
  const cfg = getNotifyConfig()
  const tasks = []
  const results = {}

  // Per-client Telegram (set in Clients edit) takes priority over the global
  // Settings config. This lets each ISP's alerts go to their own group.
  const tgToken = (clientMeta.telegramToken || cfg.telegramToken || '').trim()
  const tgChat = (clientMeta.telegramChatId || cfg.telegramChatId || '').trim()

  if (tgToken && tgChat) {
    tasks.push(
      sendTelegram(tgToken, tgChat, alert, clientMeta)
        .then(() => {
          results.telegram = { ok: true }
        })
        .catch((err) => {
          results.telegram = { ok: false, error: String(err?.message || err) }
        })
    )
  }

  if (cfg.webhookUrl) {
    tasks.push(
      fetch(cfg.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(alert, clientMeta)),
      })
        .then((res) => {
          results.webhook = { ok: res.ok, status: res.status }
        })
        .catch((err) => {
          results.webhook = { ok: false, error: String(err) }
        })
    )
  }

  if (!tasks.length) return { skipped: true }
  await Promise.all(tasks)
  return results
}
