// Runs the whole backend in ONE process group:
//   - index.js          → WhatsApp Cloud API bridge + ping   (port 4000)
//   - baileys-bridge.js → WhatsApp BOT "mahfuztitasaiagent"  (port 4001)
// Used in Docker / systemd for a 24/7 always-on deployment.
import { spawn } from 'node:child_process'

const API_PORT = process.env.API_PORT || '4000'
const BOT_PORT = process.env.BOT_PORT || '4001'

const children = [
  spawn('node', ['index.js'], { stdio: 'inherit', env: { ...process.env, PORT: API_PORT } }),
  spawn('node', ['baileys-bridge.js'], { stdio: 'inherit', env: { ...process.env, PORT: BOT_PORT } }),
]

let shuttingDown = false
function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  children.forEach((c) => c.kill('SIGTERM'))
  setTimeout(() => process.exit(0), 2000)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

children.forEach((c) => {
  c.on('exit', (code) => {
    console.log(`[start-all] child exited with ${code}`)
    if (!shuttingDown) shutdown()
  })
})

console.log(`[start-all] backend (api ${API_PORT}) + WhatsApp bot (${BOT_PORT}) started`)
