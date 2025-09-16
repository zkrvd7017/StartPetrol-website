#!/bin/bash

# StartPetrol Production Server Setup Script
# Bu script barcha servislarni avtomatik sozlaydi va ishga tushiradi

echo "🚀 StartPetrol Production Server Setup boshlandi..."

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Bazaviy o'zgaruvchilar
PROJECT_DIR="/home/ec2-user/startpetroluz/StartPetrol-website"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BOT_DIR="$PROJECT_DIR/bot"

echo -e "${BLUE}📁 Loyiha papkasi: $PROJECT_DIR${NC}"

# 1. Kerakli paketlarni o'rnatish
echo -e "\n${YELLOW}📦 Kerakli paketlarni o'rnatish...${NC}"
sudo yum update -y
sudo yum install -y nginx nodejs npm python3-pip

# 2. Python virtual environment sozlash
echo -e "\n${YELLOW}🐍 Python virtual environment sozlash...${NC}"
cd $BACKEND_DIR
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt

# 3. Frontend dependencies o'rnatish
echo -e "\n${YELLOW}⚛️ Frontend dependencies o'rnatish...${NC}"
cd $FRONTEND_DIR
npm install
npm run build

# 4. Bot dependencies o'rnatish
echo -e "\n${YELLOW}🤖 Bot dependencies o'rnatish...${NC}"
cd $BOT_DIR
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt

# 5. Django sozlamalari
echo -e "\n${YELLOW}🔧 Django sozlamalari...${NC}"
cd $BACKEND_DIR
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput

# 6. Backend systemd service yaratish
echo -e "\n${YELLOW}⚙️ Backend service yaratish...${NC}"
sudo tee /etc/systemd/system/startpetrol-backend.service > /dev/null <<EOF
[Unit]
Description=StartPetrol Backend (Gunicorn)
After=network.target

[Service]
User=ec2-user
Group=ec2-user
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$BACKEND_DIR/venv/bin"
ExecStart=$BACKEND_DIR/venv/bin/gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 120
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=3
KillMode=mixed
TimeoutStopSec=5

[Install]
WantedBy=multi-user.target
EOF

# 7. Frontend systemd service yaratish
echo -e "\n${YELLOW}🌐 Frontend service yaratish...${NC}"
sudo tee /etc/systemd/system/startpetrol-frontend.service > /dev/null <<EOF
[Unit]
Description=StartPetrol Frontend
After=network.target

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=$FRONTEND_DIR
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 3000
Restart=always
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 8. Bot systemd service yaratish
echo -e "\n${YELLOW}🤖 Bot service yaratish...${NC}"
sudo tee /etc/systemd/system/startpetrol-bot.service > /dev/null <<EOF
[Unit]
Description=StartPetrol Telegram Bot
After=network.target

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=$BOT_DIR
Environment="PATH=$BOT_DIR/venv/bin"
ExecStart=$BOT_DIR/venv/bin/python bot.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 9. Nginx konfiguratsiya
echo -e "\n${YELLOW}🌍 Nginx konfiguratsiya...${NC}"
sudo tee /etc/nginx/conf.d/startpetrol.conf > /dev/null <<EOF
server {
    listen 80;
    server_name 51.21.222.146 localhost;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files
    location /static/ {
        alias $BACKEND_DIR/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias $BACKEND_DIR/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 10. Nginx default konfigni o'chirish
sudo rm -f /etc/nginx/conf.d/default.conf

# 11. Systemd servislarni reload qilish
echo -e "\n${YELLOW}🔄 Systemd servislarni reload qilish...${NC}"
sudo systemctl daemon-reload

# 12. Barcha servislarni yoqish va ishga tushirish
echo -e "\n${YELLOW}🚀 Barcha servislarni ishga tushirish...${NC}"

# Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx

# Backend
sudo systemctl enable startpetrol-backend
sudo systemctl restart startpetrol-backend

# Frontend
sudo systemctl enable startpetrol-frontend
sudo systemctl restart startpetrol-frontend

# Bot
sudo systemctl enable startpetrol-bot
sudo systemctl restart startpetrol-bot

# 13. Servislar holatini tekshirish
echo -e "\n${BLUE}📊 Servislar holati:${NC}"

sleep 5

echo -e "\n${YELLOW}🌍 Nginx:${NC}"
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx ishlayapti${NC}"
else
    echo -e "${RED}❌ Nginx ishlamayapti${NC}"
fi

echo -e "\n${YELLOW}🔧 Backend:${NC}"
if sudo systemctl is-active --quiet startpetrol-backend; then
    echo -e "${GREEN}✅ Backend ishlayapti${NC}"
else
    echo -e "${RED}❌ Backend ishlamayapti${NC}"
    echo "Backend logs:"
    sudo journalctl -u startpetrol-backend --no-pager -l -n 10
fi

echo -e "\n${YELLOW}🌐 Frontend:${NC}"
if sudo systemctl is-active --quiet startpetrol-frontend; then
    echo -e "${GREEN}✅ Frontend ishlayapti${NC}"
else
    echo -e "${RED}❌ Frontend ishlamayapti${NC}"
    echo "Frontend logs:"
    sudo journalctl -u startpetrol-frontend --no-pager -l -n 10
fi

echo -e "\n${YELLOW}🤖 Bot:${NC}"
if sudo systemctl is-active --quiet startpetrol-bot; then
    echo -e "${GREEN}✅ Bot ishlayapti${NC}"
else
    echo -e "${RED}❌ Bot ishlamayapti${NC}"
    echo "Bot logs:"
    sudo journalctl -u startpetrol-bot --no-pager -l -n 10
fi

# 14. Port tekshirish
echo -e "\n${BLUE}🔌 Port tekshirish:${NC}"
if netstat -tlnp | grep -q ":80 "; then
    echo -e "${GREEN}✅ Port 80 (Nginx) ochiq${NC}"
else
    echo -e "${RED}❌ Port 80 yopiq${NC}"
fi

if netstat -tlnp | grep -q ":8000 "; then
    echo -e "${GREEN}✅ Port 8000 (Backend) ochiq${NC}"
else
    echo -e "${RED}❌ Port 8000 yopiq${NC}"
fi

if netstat -tlnp | grep -q ":3000 "; then
    echo -e "${GREEN}✅ Port 3000 (Frontend) ochiq${NC}"
else
    echo -e "${RED}❌ Port 3000 yopiq${NC}"
fi

# 15. Yakuniy ma'lumot
echo -e "\n${GREEN}🎉 Setup yakunlandi!${NC}"
echo -e "\n${BLUE}📍 Sayt manzillari:${NC}"
echo -e "🌐 Asosiy sayt: ${YELLOW}http://51.21.222.146${NC}"
echo -e "🔧 Backend API: ${YELLOW}http://51.21.222.146/api/${NC}"
echo -e "👤 Admin panel: ${YELLOW}http://51.21.222.146/admin/${NC}"

echo -e "\n${BLUE}🛠️ Foydali buyruqlar:${NC}"
echo -e "📊 Barcha servislar holati: ${YELLOW}sudo systemctl status startpetrol-*${NC}"
echo -e "🔄 Servisni qayta ishga tushirish: ${YELLOW}sudo systemctl restart startpetrol-backend${NC}"
echo -e "📋 Loglarni ko'rish: ${YELLOW}sudo journalctl -u startpetrol-backend -f${NC}"
echo -e "⏹️ Servisni to'xtatish: ${YELLOW}sudo systemctl stop startpetrol-backend${NC}"

echo -e "\n${GREEN}✨ Saytingiz endi production-ready va avtomatik ishga tushadi!${NC}"
echo -e "${GREEN}🔄 Server restart bo'lganda ham avtomatik qayta ishga tushadi.${NC}"
