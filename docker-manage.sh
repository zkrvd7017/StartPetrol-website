#!/bin/bash

# Docker containerlarni boshqarish script
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"

show_status() {
    echo -e "\n${BLUE}📊 Docker containerlar holati:${NC}"
    docker-compose -f $COMPOSE_FILE ps
    
    echo -e "\n${BLUE}💾 Docker images:${NC}"
    docker images | grep startpetrol
}

start_all() {
    echo -e "\n${YELLOW}🚀 Barcha containerlarni ishga tushirish...${NC}"
    docker-compose -f $COMPOSE_FILE up -d
    
    echo -e "\n${GREEN}✅ Containerlar ishga tushirildi${NC}"
    show_status
}

stop_all() {
    echo -e "\n${YELLOW}⏹️ Barcha containerlarni to'xtatish...${NC}"
    docker-compose -f $COMPOSE_FILE down
    
    echo -e "\n${GREEN}✅ Containerlar to'xtatildi${NC}"
}

restart_all() {
    echo -e "\n${YELLOW}🔄 Barcha containerlarni qayta ishga tushirish...${NC}"
    docker-compose -f $COMPOSE_FILE restart
    
    echo -e "\n${GREEN}✅ Containerlar qayta ishga tushirildi${NC}"
    show_status
}

rebuild_all() {
    echo -e "\n${YELLOW}🔨 Containerlarni qayta build qilish...${NC}"
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_FILE up --build -d
    
    echo -e "\n${GREEN}✅ Containerlar qayta build qilindi${NC}"
    show_status
}

show_logs() {
    echo -e "\n${BLUE}📋 Qaysi container logini ko'rmoqchisiz?${NC}"
    echo "1) Backend"
    echo "2) Frontend" 
    echo "3) Nginx"
    echo "4) Barcha containerlar"
    read -p "Tanlang (1-4): " choice
    
    case $choice in
        1) docker-compose -f $COMPOSE_FILE logs -f backend ;;
        2) docker-compose -f $COMPOSE_FILE logs -f frontend ;;
        3) docker-compose -f $COMPOSE_FILE logs -f nginx ;;
        4) docker-compose -f $COMPOSE_FILE logs -f ;;
        *) echo -e "${RED}Noto'g'ri tanlov!${NC}" ;;
    esac
}

cleanup_docker() {
    echo -e "\n${YELLOW}🧹 Docker tozalash...${NC}"
    echo "1) Faqat to'xtatilgan containerlarni o'chirish"
    echo "2) Ishlatilmagan imagelarni o'chirish"
    echo "3) Barcha narsani tozalash (EHTIYOT!)"
    read -p "Tanlang (1-3): " choice
    
    case $choice in
        1) 
            docker container prune -f
            echo -e "${GREEN}✅ To'xtatilgan containerlar o'chirildi${NC}"
            ;;
        2) 
            docker image prune -f
            echo -e "${GREEN}✅ Ishlatilmagan imagelar o'chirildi${NC}"
            ;;
        3)
            read -p "Haqiqatan ham barcha narsani o'chirmoqchimisiz? (y/N): " confirm
            if [[ $confirm == [yY] ]]; then
                docker system prune -a -f
                echo -e "${GREEN}✅ Docker to'liq tozalandi${NC}"
            else
                echo -e "${YELLOW}❌ Bekor qilindi${NC}"
            fi
            ;;
        *) echo -e "${RED}Noto'g'ri tanlov!${NC}" ;;
    esac
}

update_and_deploy() {
    echo -e "\n${YELLOW}📥 Kodni yangilash va qayta deploy qilish...${NC}"
    
    # Git pull
    git pull origin main
    
    # Containerlarni qayta build qilish
    rebuild_all
    
    echo -e "\n${GREEN}✅ Kod yangilandi va containerlar qayta deploy qilindi!${NC}"
}

shell_access() {
    echo -e "\n${BLUE}🐚 Qaysi containerga kirmoqchisiz?${NC}"
    echo "1) Backend"
    echo "2) Frontend"
    echo "3) Nginx"
    read -p "Tanlang (1-3): " choice
    
    case $choice in
        1) docker-compose -f $COMPOSE_FILE exec backend bash ;;
        2) docker-compose -f $COMPOSE_FILE exec frontend sh ;;
        3) docker-compose -f $COMPOSE_FILE exec nginx sh ;;
        *) echo -e "${RED}Noto'g'ri tanlov!${NC}" ;;
    esac
}

show_menu() {
    echo -e "\n${BLUE}🐳 StartPetrol Docker Boshqaruvi${NC}"
    echo -e "${BLUE}====================================${NC}"
    echo "1) 📊 Containerlar holatini ko'rish"
    echo "2) 🚀 Barcha containerlarni ishga tushirish"
    echo "3) ⏹️ Barcha containerlarni to'xtatish"
    echo "4) 🔄 Barcha containerlarni qayta ishga tushirish"
    echo "5) 🔨 Containerlarni qayta build qilish"
    echo "6) 📋 Loglarni ko'rish"
    echo "7) 🧹 Docker tozalash"
    echo "8) 📥 Kodni yangilash va qayta deploy"
    echo "9) 🐚 Container ichiga kirish"
    echo "10) 🚪 Chiqish"
    echo
}

# Asosiy menu
while true; do
    show_menu
    read -p "Tanlang (1-10): " choice
    
    case $choice in
        1) show_status ;;
        2) start_all ;;
        3) stop_all ;;
        4) restart_all ;;
        5) rebuild_all ;;
        6) show_logs ;;
        7) cleanup_docker ;;
        8) update_and_deploy ;;
        9) shell_access ;;
        10) echo -e "${GREEN}👋 Xayr!${NC}"; exit 0 ;;
        *) echo -e "${RED}❌ Noto'g'ri tanlov! 1-10 orasida raqam kiriting.${NC}" ;;
    esac
    
    echo
    read -p "Davom etish uchun Enter tugmasini bosing..."
done
