# PowerShell script for Windows
Write-Host "🚀 StartPetrol loyihani Docker bilan ishga tushirish..." -ForegroundColor Green

# Docker va Docker Compose mavjudligini tekshirish
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
    Write-Host "✅ Docker va Docker Compose topildi" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker yoki Docker Compose topilmadi. Iltimos, avval o'rnating." -ForegroundColor Red
    exit 1
}

# Eski containerlarni to'xtatish va o'chirish
Write-Host "🧹 Eski containerlarni tozalash..." -ForegroundColor Yellow
docker-compose down --remove-orphans

# Docker containerlarini yaratish va ishga tushirish
Write-Host "📦 Docker containerlarini yaratish va ishga tushirish..." -ForegroundColor Yellow
docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Loyiha muvaffaqiyatli ishga tushirildi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Frontend: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "🔧 Backend API: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "📊 Redis: localhost:6379" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Loglarni ko'rish uchun: docker-compose logs -f" -ForegroundColor White
    Write-Host "🛑 To'xtatish uchun: docker-compose down" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Loyiha ishlayapti..." -ForegroundColor Green
} else {
    Write-Host "❌ Loyihani ishga tushirishda xatolik yuz berdi!" -ForegroundColor Red
    Write-Host "📋 Loglarni ko'rish uchun: docker-compose logs" -ForegroundColor White
}