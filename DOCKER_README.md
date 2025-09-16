# StartPetrol - Docker bilan ishga tushirish

## Talablar

1. **Docker Desktop** - Windows uchun [Docker Desktop](https://www.docker.com/products/docker-desktop) o'rnating
2. **Docker Compose** - Docker Desktop bilan birga keladi

## Tezkor ishga tushirish

### PowerShell orqali (tavsiya etiladi)
```powershell
.\run.ps1
```

### Manual ishga tushirish
```bash
# Eski containerlarni tozalash
docker-compose down --remove-orphans

# Loyihani build qilish va ishga tushirish
docker-compose up --build -d
```

## Servislar

Loyiha ishga tushgandan keyin quyidagi portlarda mavjud bo'ladi:

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000  
- **Redis**: localhost:6379

## Foydali buyruqlar

### Loglarni ko'rish
```bash
# Barcha servislar loglari
docker-compose logs -f

# Faqat backend loglari
docker-compose logs -f backend

# Faqat frontend loglari  
docker-compose logs -f frontend

# Faqat bot loglari
docker-compose logs -f bot
```

### Containerlarni boshqarish
```bash
# Barcha containerlarni to'xtatish
docker-compose down

# Containerlar va volumelarni o'chirish
docker-compose down -v

# Faqat bitta serverni qayta ishga tushirish
docker-compose restart backend

# Servis holatini ko'rish
docker-compose ps
```

### Database bilan ishlash
```bash
# Django migration larni ishga tushirish
docker-compose exec backend python manage.py migrate

# Superuser yaratish
docker-compose exec backend python manage.py createsuperuser

# Django shell
docker-compose exec backend python manage.py shell
```

### Development rejimi
```bash
# Frontend ni development rejimida ishga tushirish
docker-compose exec frontend npm run dev
```

## Muammolarni hal qilish

### Port band bo'lsa
Agar portlar band bo'lsa, docker-compose.yml faylida portlarni o'zgartiring:
```yaml
ports:
  - "8081:80"  # frontend uchun
  - "8001:8000"  # backend uchun
```

### Database muammolari
```bash
# Database faylini o'chirish va qayta yaratish
docker-compose down
rm backend/db.sqlite3
docker-compose up --build -d
```

### Cache tozalash
```bash
# Docker cache ni tozalash
docker system prune -a

# Faqat loyiha imagelarini o'chirish
docker-compose down --rmi all
```

## Environment o'zgaruvchilari

Kerakli o'zgaruvchilar docker-compose.yml da sozlangan:

- `DJANGO_SECRET_KEY` - Django secret key
- `DJANGO_DEBUG` - Debug rejimi (0/1)
- `REDIS_URL` - Redis server URL
- `TELEGRAM_BOT_TOKEN` - Telegram bot token (bot uchun)
- `WEBCHAT_API_KEY` - Web chat API key

## Ishlab chiqish uchun

1. Kodni o'zgartirganingizdan keyin qayta build qiling:
```bash
docker-compose up --build
```

2. Faqat bitta serverni qayta build qilish:
```bash
docker-compose up --build backend
```

3. Container ichiga kirish:
```bash
docker-compose exec backend bash
docker-compose exec frontend sh
```
