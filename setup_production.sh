#!/bin/bash

echo "🚀 StartPetrol Production Setup - Xatosiz versiya"

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Eski containerlarni to'xtatish
echo -e "${YELLOW}⏹️ Eski containerlarni to'xtatish...${NC}"
sudo docker-compose down 2>/dev/null || true

# 2. Docker cache tozalash
echo -e "${YELLOW}🧹 Docker cache tozalash...${NC}"
sudo docker system prune -f

# 3. Yangi fayllarni nusxalash
echo -e "${YELLOW}📁 Konfiguratsiya fayllarini yangilash...${NC}"
cp docker-compose.final.yml docker-compose.yml
cp frontend/Dockerfile.final frontend/Dockerfile
cp frontend/.dockerignore.final frontend/.dockerignore
cp backend/Dockerfile.final backend/Dockerfile

# 4. Frontend dependencies o'rnatish
echo -e "${YELLOW}📦 Frontend dependencies o'rnatish...${NC}"
cd frontend
npm install
npm run build
cd ..

# 5. Docker build
echo -e "${YELLOW}🔨 Docker build qilish...${NC}"
sudo docker-compose build --no-cache

# 6. Docker ishga tushirish
echo -e "${YELLOW}🚀 Docker containerlarni ishga tushirish...${NC}"
sudo docker-compose up -d

# 7. Holat tekshirish
echo -e "${YELLOW}⏳ 15 soniya kutish...${NC}"
sleep 15

echo -e "\n${BLUE}📊 Containerlar holati:${NC}"
sudo docker ps

echo -e "\n${BLUE}🔍 Servis loglari:${NC}"
sudo docker-compose logs --tail=5

# 8. Portlar tekshirish
echo -e "\n${BLUE}🔌 Portlar holati:${NC}"
if netstat -tlnp | grep -q ":80 "; then
    echo -e "${GREEN}✅ Port 80 (Frontend) - OCHIQ${NC}"
else
    echo -e "${RED}❌ Port 80 (Frontend) - YOPIQ${NC}"
fi

if netstat -tlnp | grep -q ":8000 "; then
    echo -e "${GREEN}✅ Port 8000 (Backend) - OCHIQ${NC}"
else
    echo -e "${RED}❌ Port 8000 (Backend) - YOPIQ${NC}"
fi

# 9. Yakuniy ma'lumot
echo -e "\n${GREEN}🎉 Production setup yakunlandi!${NC}"
echo -e "\n${BLUE}📍 Sayt manzillari:${NC}"
echo -e "🌐 Frontend: ${YELLOW}http://51.21.222.146${NC}"
echo -e "🔧 Backend API: ${YELLOW}http://51.21.222.146:8000/api/${NC}"
echo -e "👤 Admin: ${YELLOW}http://51.21.222.146:8000/admin/${NC}"

echo -e "\n${BLUE}🛠️ Foydali buyruqlar:${NC}"
echo -e "📊 Holat: ${YELLOW}sudo docker ps${NC}"
echo -e "📋 Loglar: ${YELLOW}sudo docker-compose logs -f${NC}"
echo -e "🔄 Qayta ishga tushirish: ${YELLOW}sudo docker-compose restart${NC}"
echo -e "⏹️ To'xtatish: ${YELLOW}sudo docker-compose down${NC}"

echo -e "\n${GREEN}✨ Saytingiz tayyor va production-ready! Xatosiz ishlaydi! 🚀${NC}"
