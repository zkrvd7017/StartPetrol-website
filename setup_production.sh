#!/usr/bin/env bash
set -euo pipefail

if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo required; run on Ubuntu server or WSL with sudo enabled" >&2
  exit 1
fi

# Install nginx if missing
if ! command -v nginx >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y nginx
fi

# Place config
SITE_CONF="/etc/nginx/sites-available/startpetrol.conf"
if [ ! -f nginx.host.conf ]; then
  echo "nginx.host.conf not found in current directory" >&2
  exit 1
fi
sudo cp nginx.host.conf "$SITE_CONF"
sudo ln -sf "$SITE_CONF" /etc/nginx/sites-enabled/startpetrol.conf

# Test & reload
sudo nginx -t
sudo systemctl reload nginx

echo "Nginx configured. Proxying / to 127.0.0.1:3000 and /api,/admin to 127.0.0.1:8000"
