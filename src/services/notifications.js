// ---------------------------------------------------------------------------
// Outbound notification dispatcher.
// Reads notification settings from localStorage and forwards alerts to a
// backend webhook (which then calls WhatsApp Cloud API / Telegram / etc.).
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

export async function dispatchAlert(alert, clientMeta = {}) {
  const cfg = getNotifyConfig()
  if (!cfg.webhookUrl) return { skipped: true }

  const payload = {
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

  try {
    const res = await fetch(cfg.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return { ok: res.ok, status: res.status }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
