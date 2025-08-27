#!/bin/bash

echo "🚀 Fullstack loyihani ishga tushirish..."


# Docker Compose orqali loyihani ishga tushirish
echo "📦 Docker containerlarini yaratish..."
docker-compose up --build -d

echo "✅ Loyiha muvaffaqiyatli ishga tushirildi!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo ""
echo "📋 Loglarni ko'rish uchun: docker-compose logs -f"
echo "🛑 To'xtatish uchun: docker-compose down"
echo ""
echo "🎯 Loyiha ishlayapti..."