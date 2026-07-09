#!/bin/bash
# =============================================================
#  Zayron Welcome Portal — VPS Deployment Script
#  Ubuntu 24.04 | Gunicorn + Nginx
#  Run as root: bash deploy.sh
# =============================================================

set -e
APP_NAME="zayron-portal"
APP_DIR="/var/www/Zayron-Welcome-Portal"
REPO_URL="https://github.com/zayroninfotech/Zayron-Welcome-Portal.git"
DOMAIN="187.127.131.93"
PORT="8000"
PYTHON="python3"

echo "============================================"
echo "  ZAYRON WELCOME PORTAL - DEPLOYMENT"
echo "============================================"

# ── 1. System update & dependencies ──────────────────────────
echo "[1/8] Updating system & installing dependencies..."
apt update -y && apt upgrade -y
apt install -y python3 python3-pip python3-venv git nginx curl ufw

# ── 2. Install Node.js 20 ────────────────────────────────────
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# ── 3. Clone / pull project ──────────────────────────────────
echo "[3/8] Cloning project from GitHub..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git pull origin main
else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# ── 4. Python virtual env & packages ─────────────────────────
echo "[4/8] Setting up Python environment..."
$PYTHON -m venv venv
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
pip install gunicorn -q

# ── 5. Environment config ─────────────────────────────────────
echo "[5/8] Creating .env file..."
if [ ! -f .env ]; then
cat > .env <<EOF
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(50))")
DEBUG=False
ALLOWED_HOSTS=$DOMAIN,www.$DOMAIN,localhost,127.0.0.1

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=

BASE_URL=http://$DOMAIN
EOF
    echo "  .env created — edit /var/www/Zayron-Welcome-Portal/.env to add email credentials"
fi

# ── 6. Django setup (migrations only) ────────────────────────
echo "[6/8] Running Django migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput
python create_admin.py

# ── 7. Build React frontend ───────────────────────────────────
echo "[7/8] Building React frontend..."
npm install --silent
npm run build
python manage.py collectstatic --noinput --clear

# ── 8. Gunicorn systemd service ───────────────────────────────
echo "[8/8] Setting up Gunicorn service & Nginx..."

cat > /etc/systemd/system/$APP_NAME.service <<EOF
[Unit]
Description=Zayron Welcome Portal (Gunicorn)
After=network.target

[Service]
User=root
Group=root
WorkingDirectory=$APP_DIR
Environment="DJANGO_SETTINGS_MODULE=onboarding.settings"
ExecStart=$APP_DIR/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:$PORT \
    --timeout 120 \
    --access-logfile /var/log/$APP_NAME-access.log \
    --error-logfile /var/log/$APP_NAME-error.log \
    onboarding.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable $APP_NAME
systemctl restart $APP_NAME

# ── 9. Nginx config ───────────────────────────────────────────
cat > /etc/nginx/sites-available/$APP_NAME <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 20M;

    # Media files (NDA PDFs, uploads)
    location /media/ {
        alias $APP_DIR/media/;
    }

    # Static files (React build + Django admin)
    location /static/ {
        alias $APP_DIR/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Everything else → Gunicorn (Django + React SPA)
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120;
    }
}
EOF

ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ── 10. Firewall ─────────────────────────────────────────────
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "============================================"
echo "  DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "  App URL    : http://$DOMAIN"
echo "  Login      : admin / Admin@123"
echo "  Django Admin: http://$DOMAIN/admin"
echo ""
echo "  IMPORTANT: Edit email settings:"
echo "  nano $APP_DIR/.env"
echo ""
echo "  Useful commands:"
echo "  systemctl status $APP_NAME     # check app"
echo "  systemctl restart $APP_NAME    # restart app"
echo "  journalctl -u $APP_NAME -f     # live logs"
echo "============================================"
