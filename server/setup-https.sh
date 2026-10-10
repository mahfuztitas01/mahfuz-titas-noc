#!/usr/bin/env bash
# ===========================================================================
# Mahfuz Titas NOC — full 24/7 setup on an Ubuntu VM, WITH HTTPS.
#
# WHY HTTPS: the NOC website is served over HTTPS (GitHub Pages). A browser on
# an HTTPS page cannot call an http:// bot URL (mixed-content block). Caddy
# gives the VM a real HTTPS certificate automatically (Let's Encrypt), so the
# public site can reach the bot.
#
# ---- ONE-TIME (browser, ~3 min) -------------------------------------------
#  1. Create a FREE domain at https://www.duckdns.org  (log in with Google).
#       e.g.  mahfuztitas.duckdns.org   -> set its IP to this VM's public IP.
#  2. In OCI: VCN -> Security List -> add Ingress rules (Source 0.0.0.0/0):
#       TCP 22, TCP 80, TCP 443
#
# ---- RUN (on the VM, after SSH) -------------------------------------------
#   curl -fsSL https://raw.githubusercontent.com/mahfuztitas01/mahfuz-titas-noc/main/server/setup-https.sh | sudo -E bash -s -- mahfuztitas.duckdns.org
# ===========================================================================
set -e

DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then
  echo "Usage: bash setup-https.sh <your-domain>   (e.g. mahfuztitas.duckdns.org)"
  exit 1
fi

REPO="https://github.com/mahfuztitas01/mahfuz-titas-noc.git"
APP_DIR="/opt/mtnoc"

echo "==> [1/6] Installing system packages (git, curl, node, caddy) ..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git curl gnupg ca-certificates apt-transport-https iptables-persistent

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

if ! command -v caddy >/dev/null 2>&1; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi

echo "==> [2/6] Fetching app ..."
mkdir -p "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull --ff-only || true
else
  rm -rf "$APP_DIR"
  git clone "$REPO" "$APP_DIR"
fi

echo "==> [3/6] Installing bot dependencies ..."
cd "$APP_DIR/server"
[ -f .env ] || cp .env.example .env
npm install --omit=dev

echo "==> [4/6] Writing Caddy reverse proxy for https://$DOMAIN ..."
cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
    encode gzip
    @api path /api/*
    handle @api {
        reverse_proxy localhost:4000
    }
    handle {
        reverse_proxy localhost:4001
    }
}
EOF
systemctl enable caddy >/dev/null 2>&1 || true
systemctl restart caddy

echo "==> [5/6] Installing systemd service (auto-start + auto-restart) ..."
cp "$APP_DIR/server/mtnoc-backend.service" /etc/systemd/system/mtnoc-backend.service
systemctl daemon-reload
systemctl enable mtnoc-backend >/dev/null 2>&1 || true

echo "==> [6/6] Opening firewall (80, 443) ..."
iptables -I INPUT -p tcp --dport 80 -j ACCEPT || true
iptables -I INPUT -p tcp --dport 443 -j ACCEPT || true
netfilter-persistent save >/dev/null 2>&1 || true
if command -v ufw >/dev/null 2>&1; then ufw allow 80/tcp || true; ufw allow 443/tcp || true; fi

echo
echo "======================================================================"
echo " DONE. HTTPS + bot will auto-start and survive reboot."
echo
echo " STEP A — log the bot into WhatsApp (ONE time, scans a QR):"
echo "   cd $APP_DIR/server && node baileys-bridge.js"
echo "   (WhatsApp -> Linked devices -> scan, wait for 'connected', Ctrl+C)"
echo "   then:  systemctl restart mtnoc-backend"
echo
echo " STEP B — in the NOC app (Settings):"
echo "   Monitoring  -> Backend URL      : https://$DOMAIN"
echo "   Notifications -> Bot server URL : https://$DOMAIN"
echo "   Notifications -> Webhook URL    : https://$DOMAIN/alerts"
echo "   Notifications -> paste group link -> 'Connect bot to group'"
echo "======================================================================"
