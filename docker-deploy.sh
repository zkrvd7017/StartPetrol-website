#!/bin/bash

echo "🐳 StartPetrol Docker bilan ishga tushirish..."

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📁 Hozirgi papka: $(pwd)${NC}"

# 1. Docker va Docker Compose o'rnatish (agar yo'q bo'lsa)
echo -e "\n${YELLOW}📦 Docker o'rnatish...${NC}"
sudo yum update -y
sudo yum install -y docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -a -G docker ec2-user

# Docker Compose o'rnatish
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo -e "${GREEN}✅ Docker o'rnatildi${NC}"

# 2. Docker Compose fayl yaratish
echo -e "\n${YELLOW}📝 Docker Compose fayl yaratish...${NC}"
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: startpetrol-backend
    restart: unless-stopped
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings
      - PYTHONUNBUFFERED=1
      - DJANGO_DEBUG=0
      - DJANGO_SECRET_KEY=startpetrol-super-secret-key-2025
      - ALLOWED_HOSTS=51.21.222.146,localhost,127.0.0.1,0.0.0.0,*
    ports:
      - "8000:8000"
    volumes:
      - ./backend/staticfiles:/app/staticfiles
      - ./backend/media:/app/media
      - ./backend/db.sqlite3:/app/db.sqlite3
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: startpetrol-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    container_name: startpetrol-nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./backend/staticfiles:/var/www/static
      - ./backend/media:/var/www/media
    depends_on:
      - backend
      - frontend
EOF

# 3. Backend Dockerfile yaratish
echo -e "\n${YELLOW}🐍 Backend Dockerfile yaratish...${NC}"
cat > Dockerfile.backend << 'EOF'
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy backend code
COPY backend/ /app/

# Create directories
RUN mkdir -p /app/staticfiles /app/media

EXPOSE 8000
EOF

# 4. Frontend Dockerfile yaratish
echo -e "\n${YELLOW}⚛️ Frontend Dockerfile yaratish...${NC}"
cat > Dockerfile.frontend << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend code
COPY frontend/ ./

# Build the app
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
EOF

# 5. Nginx konfiguratsiya yaratish
echo -e "\n${YELLOW}🌍 Nginx konfiguratsiya yaratish...${NC}"
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name 51.21.222.146 localhost;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location /static/ {
        alias /var/www/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /var/www/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 6. Eski containerlarni to'xtatish
echo -e "\n${YELLOW}🧹 Eski containerlarni tozalash...${NC}"
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# 7. Docker containerlarni build qilish va ishga tushirish
echo -e "\n${YELLOW}🚀 Docker containerlarni build qilish va ishga tushirish...${NC}"
docker-compose -f docker-compose.prod.yml up --build -d

# 8. Containerlar holatini tekshirish
echo -e "\n${BLUE}📊 Containerlar holati:${NC}"
sleep 10

docker-compose -f docker-compose.prod.yml ps

# 9. Loglarni ko'rsatish
echo -e "\n${BLUE}📋 Container loglari:${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=10

# 10. Portlarni tekshirish
echo -e "\n${BLUE}🔌 Portlar holati:${NC}"
if netstat -tlnp | grep -q ":80 "; then
    echo -e "${GREEN}✅ Port 80 (Nginx) - OCHIQ${NC}"
else
    echo -e "${RED}❌ Port 80 (Nginx) - YOPIQ${NC}"
fi

if netstat -tlnp | grep -q ":8000 "; then
    echo -e "${GREEN}✅ Port 8000 (Backend) - OCHIQ${NC}"
else
    echo -e "${RED}❌ Port 8000 (Backend) - YOPIQ${NC}"
fi

if netstat -tlnp | grep -q ":3000 "; then
    echo -e "${GREEN}✅ Port 3000 (Frontend) - OCHIQ${NC}"
else
    echo -e "${RED}❌ Port 3000 (Frontend) - YOPIQ${NC}"
fi

echo -e "\n${GREEN}🎉 Docker setup yakunlandi!${NC}"
echo -e "\n${BLUE}📍 Sayt manzillari:${NC}"
echo -e "🌐 Asosiy sayt: ${YELLOW}http://51.21.222.146${NC}"
echo -e "🔧 Backend API: ${YELLOW}http://51.21.222.146/api/${NC}"
echo -e "👤 Admin panel: ${YELLOW}http://51.21.222.146/admin/${NC}"

echo -e "\n${BLUE}🛠️ Foydali buyruqlar:${NC}"
echo -e "📊 Containerlar holati: ${YELLOW}docker-compose -f docker-compose.prod.yml ps${NC}"
echo -e "📋 Loglarni ko'rish: ${YELLOW}docker-compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "🔄 Qayta ishga tushirish: ${YELLOW}docker-compose -f docker-compose.prod.yml restart${NC}"
echo -e "⏹️ To'xtatish: ${YELLOW}docker-compose -f docker-compose.prod.yml down${NC}"

echo -e "\n${GREEN}✨ Saytingiz Docker bilan production-ready ishlamoqda!${NC}"
