#!/bin/bash

# StartPetrol Servislarni boshqarish script
# Bu script orqali barcha servislarni boshqarishingiz mumkin

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVICES=("nginx" "startpetrol-backend" "startpetrol-frontend" "startpetrol-bot")

show_status() {
    echo -e "\n${BLUE}📊 Barcha servislar holati:${NC}"
    for service in "${SERVICES[@]}"; do
        if sudo systemctl is-active --quiet $service; then
            echo -e "${GREEN}✅ $service - ISHLAMOQDA${NC}"
        else
            echo -e "${RED}❌ $service - TO'XTATILGAN${NC}"
        fi
    done
}

start_all() {
    echo -e "\n${YELLOW}🚀 Barcha servislarni ishga tushirish...${NC}"
    for service in "${SERVICES[@]}"; do
        echo -e "${BLUE}Ishga tushirilmoqda: $service${NC}"
        sudo systemctl start $service
        if sudo systemctl is-active --quiet $service; then
            echo -e "${GREEN}✅ $service ishga tushdi${NC}"
        else
            echo -e "${RED}❌ $service ishga tushmadi${NC}"
        fi
    done
}

stop_all() {
    echo -e "\n${YELLOW}⏹️ Barcha servislarni to'xtatish...${NC}"
    for service in "${SERVICES[@]}"; do
        echo -e "${BLUE}To'xtatilmoqda: $service${NC}"
        sudo systemctl stop $service
        echo -e "${GREEN}✅ $service to'xtatildi${NC}"
    done
}

restart_all() {
    echo -e "\n${YELLOW}🔄 Barcha servislarni qayta ishga tushirish...${NC}"
    for service in "${SERVICES[@]}"; do
        echo -e "${BLUE}Qayta ishga tushirilmoqda: $service${NC}"
        sudo systemctl restart $service
        if sudo systemctl is-active --quiet $service; then
            echo -e "${GREEN}✅ $service qayta ishga tushdi${NC}"
        else
            echo -e "${RED}❌ $service qayta ishga tushmadi${NC}"
        fi
    done
}

show_logs() {
    echo -e "\n${BLUE}📋 Qaysi servis logini ko'rmoqchisiz?${NC}"
    echo "1) Backend"
    echo "2) Frontend" 
    echo "3) Bot"
    echo "4) Nginx"
    echo "5) Barcha servislar"
    read -p "Tanlang (1-5): " choice
    
    case $choice in
        1) sudo journalctl -u startpetrol-backend -f ;;
        2) sudo journalctl -u startpetrol-frontend -f ;;
        3) sudo journalctl -u startpetrol-bot -f ;;
        4) sudo journalctl -u nginx -f ;;
        5) sudo journalctl -u startpetrol-backend -u startpetrol-frontend -u startpetrol-bot -u nginx -f ;;
        *) echo -e "${RED}Noto'g'ri tanlov!${NC}" ;;
    esac
}

check_ports() {
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
}

update_code() {
    echo -e "\n${YELLOW}📥 Kodni yangilash va servislarni qayta ishga tushirish...${NC}"
    
    PROJECT_DIR="/home/ec2-user/startpetroluz/StartPetrol-website"
    
    # Git pull
    cd $PROJECT_DIR
    git pull origin main
    
    # Backend yangilash
    echo -e "${BLUE}Backend yangilanmoqda...${NC}"
    cd $PROJECT_DIR/backend
    source venv/bin/activate
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py collectstatic --noinput
    
    # Frontend yangilash
    echo -e "${BLUE}Frontend yangilanmoqda...${NC}"
    cd $PROJECT_DIR/frontend
    npm install
    npm run build
    
    # Bot yangilash
    echo -e "${BLUE}Bot yangilanmoqda...${NC}"
    cd $PROJECT_DIR/bot
    source venv/bin/activate
    pip install -r requirements.txt
    
    # Servislarni qayta ishga tushirish
    restart_all
    
    echo -e "${GREEN}✅ Kod yangilandi va servislar qayta ishga tushdi!${NC}"
}

show_menu() {
    echo -e "\n${BLUE}🎛️ StartPetrol Servis Boshqaruvi${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo "1) 📊 Servislar holatini ko'rish"
    echo "2) 🚀 Barcha servislarni ishga tushirish"
    echo "3) ⏹️ Barcha servislarni to'xtatish"
    echo "4) 🔄 Barcha servislarni qayta ishga tushirish"
    echo "5) 📋 Loglarni ko'rish"
    echo "6) 🔌 Portlarni tekshirish"
    echo "7) 📥 Kodni yangilash va qayta ishga tushirish"
    echo "8) 🚪 Chiqish"
    echo
}

# Asosiy menu
while true; do
    show_menu
    read -p "Tanlang (1-8): " choice
    
    case $choice in
        1) show_status ;;
        2) start_all ;;
        3) stop_all ;;
        4) restart_all ;;
        5) show_logs ;;
        6) check_ports ;;
        7) update_code ;;
        8) echo -e "${GREEN}👋 Xayr!${NC}"; exit 0 ;;
        *) echo -e "${RED}❌ Noto'g'ri tanlov! 1-8 orasida raqam kiriting.${NC}" ;;
    esac
    
    echo
    read -p "Davom etish uchun Enter tugmasini bosing..."
done
