# Mahfuz Titas NOC — WhatsApp Alert Bridge (WhatsApp Cloud API)

This tiny backend receives **threshold alerts** from the NOC web app and forwards
them to **WhatsApp** using the official **WhatsApp Business Cloud API (Meta)**.

```
┌──────────────────────┐   POST /alerts    ┌───────────────────────┐   HTTPS   ┌──────────────────────┐
│  Mahfuz Titas NOC    │  (JSON alert)     │  WhatsApp Bridge      │  Graph    │  WhatsApp Cloud API  │
│  (React web app)     │ ────────────────► │  server/index.js      │ ────────► │  graph.facebook.com  │
│  useAlertEngine.js   │                   │  (this server)        │           │  → your phone 📱     │
└──────────────────────┘                   └───────────────────────┘           └──────────────────────┘
```

Why a backend? A browser **cannot** send WhatsApp messages directly — WhatsApp
requires a server-side token call. The NOC app already POSTs every new
threshold alert to a **Webhook URL** (Settings → Notifications → Webhook URL).

---

## 1. Prerequisites
- A **Meta (Facebook) account**
- A **phone number** you can receive an SMS/WhatsApp on (for the test number)
- Node.js 18+ (already installed for the NOC app)

---

## 2. Create the WhatsApp app (one time, ~5 min)
1. Go to **https://developers.facebook.com/** → **My Apps** → **Create App**.
2. Choose **Business** type → give it a name (e.g. `Mahfuz Titas NOC Alerts`) → Create.
3. On the app dashboard, add the **WhatsApp** product → **Set up**.
4. Open **WhatsApp → API Setup**. You will see:
   - **Temporary access token** (24h — fine for testing)
   - **Phone number ID** (a long number)
   - A **test phone number** provided by Meta
5. Under **"To"**, add your own phone number as a **recipient** and verify it
   (test mode can only message verified recipients).

> For production you will create a **System User + permanent token**, verify your
> own business number, and use **message templates** (see §7).

---

## 3. Configure `.env`
Copy the example file and fill in your values:

```bash
cd server
copy .env.example .env      # Windows
# or: cp .env.example .env
```

```env
PORT=4000
WHATSAPP_PHONE_NUMBER_ID=1234567890123456      # from API Setup
WHATSAPP_TOKEN=EAAG...                          # temporary token (testing)
WHATSAPP_TO=8801XXXXXXXXX                       # your number, no + sign
WHATSAPP_API_VERSION=v21.0
```

Multiple recipients: `WHATSAPP_TO=8801711111111,8801822222222`

---

## 4. Run the bridge
```bash
cd server
npm install
npm start
# → Mahfuz Titas NOC — WhatsApp bridge listening on http://localhost:4000
# → WhatsApp: configured ✅
```

Health check: open **http://localhost:4000/health**

---

## 5. Point the NOC app to the bridge
1. In the NOC web app → **Settings → Notifications**.
2. Set **Webhook URL** = `http://localhost:4000/alerts`
3. Click **Save Changes**.

Now every auto-generated threshold alert (bandwidth / latency / CPU / PPPoE)
is POSTed to the bridge and forwarded to WhatsApp.

---

## 6. Test it
- Manual test (no browser needed):
  ```bash
  curl -X POST http://localhost:4000/alerts -H "Content-Type: application/json" ^
    -d "{\"alert\":{\"severity\":\"critical\",\"title\":\"High CPU utilization\",\"device\":\"CORE-RT-1\",\"time\":\"10:42 AM\",\"status\":\"open\",\"description\":\"CPU above 90%\"}}"
  ```
- Or just wait on the Dashboard — when a metric crosses its threshold, a WhatsApp
  message arrives.

Expected payload the NOC sends:
```json
{
  "app": "Mahfuz Titas NOC",
  "source": "NOC Web",
  "sentAt": "2026-10-07T10:42:00.000Z",
  "alert": {
    "id": "cpu-1728300000000",
    "title": "High CPU utilization",
    "severity": "critical",
    "device": "CORE-RT-1",
    "time": "10:42 AM",
    "status": "open",
    "description": "Core router CPU sustained above 90%. (current: 92)"
  }
}
```

---

## 6b. Per-client + Engineer "group" routing

Each alert is sent to **two sets of recipients**:

1. **Engineer group** — every number in `ENGINEER_NUMBERS` (the NOC engineers).
2. **The client's own number** — from the active client (`client.whatsapp` in the app)
   or overridden by the server-side `CLIENT_ROUTES` map.

```env
ENGINEER_NUMBERS=8801711111111,8801822222222,8801933333333
CLIENT_ROUTES={"rahim":"8801710000001","karim":"8801710000002"}
```

The NOC app sends the active client with every alert:
```json
{ "client": { "id": "rahim", "name": "Rahim ISP Networks", "short": "RIM", "whatsapp": "8801710000001" },
  "alert": { "title": "High CPU utilization", "severity": "critical" } }
```

Check current routing (masked): **GET http://localhost:4000/config**

> ⚠️ **WhatsApp groups:** the official **Cloud API cannot post into a real WhatsApp
> group**. We therefore broadcast to the engineer numbers (group effect). If you
> truly need a native WhatsApp **group**, you must use an unofficial gateway
> (e.g. Baileys) — not recommended for production.

Message preview (client is included in the body):
```
🔴 *MAHFUZ TITAS NOC — CRITICAL*

Client: *Rahim ISP Networks* (RIM)
*High CPU utilization*
Device: RIM-CORE-RT-1
Time: 10:42 AM
Status: open
Details: Core router CPU sustained above 90%. (current: 92)
```

---

## 7. Production hardening
| Item | What to do |
|------|------------|
| **Permanent token** | Meta → Business Settings → **System Users** → generate a token with `whatsapp_business_messaging` |
| **Own number** | Verify your business number in WhatsApp Manager and use its Phone Number ID |
| **Templates** | Free-form text only works within 24h of a user message. For proactive alerts, create an **approved message template** (e.g. `alert_notification`) and switch the code to `type: 'template'` |
| **Hosting** | Deploy the bridge on your server (PM2/Docker), expose HTTPS |
| **Security** | Add an API key header check + restrict CORS to your NOC domain |
| **Multiple channels** | Add Telegram (Bot API) and email (SMTP) in the same server |

### Using a message template (production)
```js
const payload = {
  messaging_product: 'whatsapp',
  to,
  type: 'template',
  template: {
    name: 'alert_notification',        // your approved template
    language: { code: 'en_US' },
    components: [
      { type: 'body', parameters: [
        { type: 'text', text: alert.severity },
        { type: 'text', text: alert.title },
        { type: 'text', text: alert.device },
      ] },
    ],
  },
}
```

---

## 8. Troubleshooting
| Symptom | Fix |
|---------|-----|
| Bridge logs "NOT configured" | `.env` missing/incomplete → set token + phone id + `to` |
| 401 / OAuthException from Meta | Token expired (temporary tokens last 24h) → use a permanent System User token |
| 131047 "re-engagement" | You're outside the 24h window → use a **template** |
| Message not received | Recipient not verified (test mode), or wrong format (must be `8801...`, no `+`) |
| Nothing in bridge log | NOC webhook URL not saved, or app not running on same machine |
| CORS error in browser | Ensure `cors()` is enabled (it is by default here) |

---

## 9. File map
```
server/
  index.js          # Express server: POST /alerts → WhatsApp Cloud API
  package.json      # deps (express, cors, dotenv)
  .env.example      # copy to .env and fill in
  README.md         # this guide
```
