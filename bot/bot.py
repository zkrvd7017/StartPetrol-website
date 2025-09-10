import os
import logging
from typing import Optional
from dotenv import load_dotenv
import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8292073084:AAGlXM2JW-y8kXU9XNYPJPrq-5lCFMOXdAY")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "5839496652")
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://127.0.0.1:8000")
WEBCHAT_API_KEY = os.getenv("WEBCHAT_API_KEY", "")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Foydalanuvchi xabarlarini saqlash uchun
user_messages = {}


def parse_session(text: str) -> Optional[str]:
    for line in (text or "").splitlines():
        if line.startswith("session:"):
            
            return line.split(":", 1)[1].strip()
    return None


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    user_name = update.effective_user.first_name or "Noma'lum"
    
    # Admin'ga yangi foydalanuvchi haqida xabar
    if str(user_id) != str(ADMIN_CHAT_ID):
        admin_msg = f"🆕 Yangi foydalanuvchi botni ishga tushirdi!\nUser ID: {user_id}\nIsm: {user_name}"
        try:
            await context.bot.send_message(chat_id=ADMIN_CHAT_ID, text=admin_msg)
        except:
            pass
    
    await update.message.reply_text("Salom! StartPetrol bot ishga tushdi. Xabaringizni yozing, admin javob beradi.")


async def cmd_id(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id if update and update.effective_chat else None
    await update.message.reply_text(f"Chat ID: {chat_id}")


async def handle_user_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Foydalanuvchi xabarlarini admin'ga yuborish"""
    user_id = update.effective_user.id
    user_name = update.effective_user.first_name or "Noma'lum"
    user_message = update.message.text
    
    # Agar admin yozayotgan bo'lsa, handle_admin funksiyasiga o'tkazish
    if str(user_id) == str(ADMIN_CHAT_ID):
        await handle_admin(update, context)
        return
    
    # Foydalanuvchi xabarini admin'ga yuborish
    admin_message = f"👤 Foydalanuvchi: {user_name} (ID: {user_id})\n💬 Xabar: {user_message}"
    
    try:
        # Admin'ga xabarni yuborish
        sent_message = await context.bot.send_message(chat_id=ADMIN_CHAT_ID, text=admin_message)
        
        # Xabar ID sini saqlash (reply uchun)
        user_messages[sent_message.message_id] = user_id
        
        # Foydalanuvchiga tasdiqlash
        await update.message.reply_text("✅ Xabaringiz admin'ga yuborildi. Javob kuting...")
        
    except Exception as e:
        logger.error(f"Admin'ga xabar yuborishda xato: {e}")
        await update.message.reply_text("❌ Xatolik yuz berdi. Keyinroq urinib ko'ring.")


async def handle_admin(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Admin reply qilganda foydalanuvchiga javob yuborish"""
    if str(update.effective_chat.id) != str(ADMIN_CHAT_ID):
        return
    
    msg = update.message
    if not msg or not msg.text:
        return

    # Agar admin reply qilgan bo'lsa
    if msg.reply_to_message:
        reply_to_id = msg.reply_to_message.message_id
        
        # Reply qilingan xabar foydalanuvchi xabari ekanligini tekshirish
        if reply_to_id in user_messages:
            user_id = user_messages[reply_to_id]
            admin_response = msg.text
            
            try:
                # Foydalanuvchiga admin javobini yuborish
                await context.bot.send_message(
                    chat_id=user_id, 
                    text=f"💬 Admin javobi:\n{admin_response}"
                )
                
                # Admin'ga tasdiqlash
                await msg.reply_text("✅ Javob foydalanuvchiga yuborildi!")
                
                # Xabar ID ni o'chirish
                del user_messages[reply_to_id]
                
            except Exception as e:
                logger.error(f"Foydalanuvchiga javob yuborishda xato: {e}")
                await msg.reply_text("❌ Javob yuborishda xatolik yuz berdi.")
        else:
            await msg.reply_text("❌ Bu xabar foydalanuvchi xabari emas yoki eski xabar.")
    else:
        # Eski session usuli (backup)
        replied = ""
        session_id = parse_session(msg.text)
        if not session_id:
            await msg.reply_text("💡 Foydalanuvchi xabariga reply qiling yoki session:{user_id} formatida yozing.")
            return
        
        try:
            payload = {"session_id": session_id, "content": msg.text}
            if WEBCHAT_API_KEY:
                payload["api_key"] = WEBCHAT_API_KEY
            r = requests.post(f"{BACKEND_BASE_URL}/api/receive-answer", json=payload, timeout=5)
            if r.status_code == 200:
                await msg.reply_text("✅ Yuborildi (backend orqali)")
            else:
                await msg.reply_text(f"❌ Xato: {r.status_code}")
        except Exception as e:
            logger.exception("receive-answer error")
            await msg.reply_text("❌ Ulanish xatosi")


def main():
    assert TELEGRAM_BOT_TOKEN, "TELEGRAM_BOT_TOKEN yo'q"
    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # Buyruqlar
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("id", cmd_id))
    
    # Barcha matn xabarlar uchun
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_user_message))
    
    logger.info("StartPetrol bot ishga tushdi!")
    logger.info(f"Admin ID: {ADMIN_CHAT_ID}")
    app.run_polling()


if __name__ == "__main__":
    main()
