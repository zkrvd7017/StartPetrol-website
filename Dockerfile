############################
# Frontend build stage
############################
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/. .
RUN npm run build

############################
# Backend base stage
############################
FROM python:3.11-slim AS backend-base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /backend
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    pkg-config \
    libffi-dev \
  && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt /backend/requirements.txt
RUN pip install --upgrade pip && pip install --no-cache-dir -r /backend/requirements.txt
COPY backend/. /backend
RUN python manage.py collectstatic --noinput || true

############################
# Backend runtime target
############################
FROM backend-base AS backend
WORKDIR /backend
EXPOSE 8000
# CMD olib tashlaymiz, chunki compose ichida yozilyapti

############################
# Bot target
############################
FROM python:3.11-slim AS bot
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /bot
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
  && rm -rf /var/lib/apt/lists/*
COPY bot/requirements.txt /bot/requirements.txt
RUN pip install --upgrade pip && pip install --no-cache-dir -r /bot/requirements.txt
COPY bot/. /bot
CMD ["python", "bot.py"]

############################
# Frontend runtime (nginx) target
############################
FROM nginx:1.27-alpine AS frontend
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


