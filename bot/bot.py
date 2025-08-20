import os
import logging
from typing import Optional
from dotenv import load_dotenv
import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "")
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://127.0.0.1:8000")
WEBCHAT_API_KEY = os.getenv("WEBCHAT_API_KEY", "")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def parse_session(text: str) -> Optional[str]:
    for line in (text or "").splitlines():
        if line.startswith("session:"):
            return line.split(":", 1)[1].strip()
    return None


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Salom! Admin relay bot ishga tushdi.")


async def cmd_id(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id if update and update.effective_chat else None
    await update.message.reply_text(f"Chat ID: {chat_id}")


async def handle_admin(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if str(update.effective_chat.id) != str(ADMIN_CHAT_ID):
        return
    msg = update.message
    if not msg or not msg.text:
        return

    replied = msg.reply_to_message.text if msg.reply_to_message and msg.reply_to_message.text else ""
    session_id = parse_session(replied) or parse_session(msg.text)
    if not session_id:
        await msg.reply_text("session:{uuid} topilmadi. Reply qiling yoki matnda session qo'ying.")
        return
    try:
        payload = {"session_id": session_id, "content": msg.text}
        if WEBCHAT_API_KEY:
            payload["api_key"] = WEBCHAT_API_KEY
        r = requests.post(f"{BACKEND_BASE_URL}/api/receive-answer", json=payload, timeout=5)
        if r.status_code == 200:
            await msg.reply_text("Yuborildi ✅")
        else:
            await msg.reply_text(f"Xato: {r.status_code}")
    except Exception as e:
        logger.exception("receive-answer error")
        await msg.reply_text("Ulanish xatosi")


def main():
    assert TELEGRAM_BOT_TOKEN, "TELEGRAM_BOT_TOKEN yo'q"
    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("id", cmd_id))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_admin))
    logger.info("Bot started")
    app.run_polling()


if __name__ == "__main__":
    main()
