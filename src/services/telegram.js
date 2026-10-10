// ---------------------------------------------------------------------------
// Telegram helpers — used from the browser (no backend).
// Telegram's Bot API cannot convert a t.me invite link into a chat id directly,
// so when the user pastes a group LINK we read the bot's recent updates: when a
// bot is added to a group it receives a `my_chat_member` update carrying the
// chat id + title. The newest such group is used.
// ---------------------------------------------------------------------------

export async function fetchBotGroups(token) {
  const t = String(token || '').trim()
  if (!t) throw new Error('No bot token')
  const res = await fetch(`https://api.telegram.org/bot${t}/getUpdates?timeout=0`)
  const data = await res.json().catch(() => ({}))
  if (!data.ok) throw new Error(data.description || `getUpdates failed (${res.status})`)
  const seen = new Map()
  for (const u of data.result || []) {
    const chat = u.message?.chat || u.channel_post?.chat || u.my_chat_member?.chat || u.edited_message?.chat
    if (chat && ['group', 'supergroup', 'channel'].includes(chat.type)) {
      seen.set(String(chat.id), {
        id: String(chat.id),
        title: chat.title || chat.username || String(chat.id),
        type: chat.type,
      })
    }
  }
  return [...seen.values()].reverse() // newest first
}

export async function resolveTelegramChat(token, raw) {
  const v = String(raw || '').trim()
  if (!v) return { ok: false, reason: 'Paste a group link or chat id first' }
  if (/^-?\d+$/.test(v)) return { ok: true, chatId: v, title: null }
  const groups = await fetchBotGroups(token)
  if (!groups.length) {
    return {
      ok: false,
      reason: 'Bot is in no group yet — add the bot to the group, send any message there, then press Connect again.',
    }
  }
  const g = groups[0]
  return { ok: true, chatId: g.id, title: g.title, groups }
}
