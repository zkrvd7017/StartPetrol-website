# Telegram Bot (Standalone)

This folder runs a relay bot that connects your site chat with Telegram admins.

## Setup
1. Create `.env` with:
```
TELEGRAM_BOT_TOKEN=YOUR_TOKEN
ADMIN_CHAT_ID=5839496652
BACKEND_BASE_URL=http://127.0.0.1:8000
WEBCHAT_API_KEY=
```
2. Install deps:
```
python -m venv .venv
./.venv/Scripts/Activate.ps1
pip install -r requirements.txt
```
3. Run bot:
```
python bot.py
```
