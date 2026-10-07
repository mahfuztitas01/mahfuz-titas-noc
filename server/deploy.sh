#!/usr/bin/env bash
# ===========================================================================
# Mahfuz Titas NOC — one-command deploy (Ubuntu 22.04+)
# Best FREE 24/7 option: Oracle Cloud "Always Free" VM (or any Ubuntu VM).
#
# Usage (on the VM, after SSH):
#   curl -fsSL https://raw.githubusercontent.com/mahfuztitas01/mahfuz-titas-noc/main/server/deploy.sh | bash
# or copy this file to the VM and:  bash deploy.sh
# ===========================================================================
set -e

REPO="https://github.com/mahfuztitas01/mahfuz-titas-noc.git"
APP_DIR="/opt/mtnoc"

echo "==> Installing git + Node 20 ..."
sudo apt-get update -y
sudo apt-get install -y git curl ufw
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Fetching app ..."
sudo mkdir -p "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  sudo git -C "$APP_DIR" pull --ff-only || true
else
  sudo rm -rf "$APP_DIR"
  sudo git clone "$REPO" "$APP_DIR"
fi

echo "==> Installing dependencies (Baileys needs git) ..."
cd "$APP_DIR/server"
[ -f .env ] || sudo cp .env.example .env
sudo npm install --omit=dev

echo "==> Installing systemd service (auto-start + auto-restart) ..."
sudo cp "$APP_DIR/server/mtnoc-backend.service" /etc/systemd/system/mtnoc-backend.service
sudo systemctl daemon-reload
sudo systemctl enable mtnoc-backend

echo "==> Opening firewall ports 4000 & 4001 ..."
sudo ufw allow 4000/tcp || true
sudo ufw allow 4001/tcp || true

echo "==> Starting ..."
sudo systemctl restart mtnoc-backend

echo
echo "======================================================================"
echo " DONE. Service is running (auto-restarts, survives reboot)."
echo
echo " ONE-TIME: log into WhatsApp for the bot (scan QR):"
echo "   cd $APP_DIR/server && sudo node baileys-bridge.js"
echo "   (scan with the bot number -> Linked devices, then Ctrl+C)"
echo
echo " Then in the NOC app (Settings -> Notifications):"
echo "   Bot server URL : http://<VM-PUBLIC-IP>:4001"
echo "   Group link     : paste your group link -> Connect bot to group"
echo "   Webhook URL    : http://<VM-PUBLIC-IP>:4001/alerts"
echo "======================================================================"
