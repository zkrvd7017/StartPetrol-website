import os
from django.core.management.base import BaseCommand, CommandError
from api.chat_logic import get_chat_reply
from api.models import WebChatSession, WebChatMessage
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

try:
	from telegram import Update, Message
	from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
except Exception as exc:  # pragma: no cover
	raise CommandError("python-telegram-bot is required. Install it via pip.") from exc


class Command(BaseCommand):
	help = "Run Telegram bot with admin relay. User messages are relayed to admin; admin replies are sent back to the user and stored in web chat."

	def add_arguments(self, parser):
		parser.add_argument("--token", type=str, default=None, help="Telegram bot token (or set TELEGRAM_BOT_TOKEN env)")
		parser.add_argument("--admin_chat_id", type=str, default=None, help="Admin chat ID (or set TELEGRAM_ADMIN_CHAT_ID env)")

	async def cmd_start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):  # type: ignore
		await update.message.reply_text("Salom! Savolingizni yozing, admin javobini bu yerda olasiz.")  # type: ignore

	async def cmd_id(self, update: Update, context: ContextTypes.DEFAULT_TYPE):  # type: ignore
		chat_id = update.effective_chat.id if update and update.effective_chat else None
		await update.message.reply_text(f"Chat ID: {chat_id}")  # type: ignore

	def _format_user_to_admin(self, message: Message) -> str:  # type: ignore
		user = message.from_user
		return (
			f"#user\n"
			f"user_id:{user.id}\n"
			f"chat_id:{message.chat.id}\n"
			f"name:{user.full_name}\n"
			f"username:@{user.username if user.username else '-'}\n\n"
			f"{message.text or ''}"
		)

	def _parse_admin_reply(self, text: str):
		# Accept either user_id: or session:<uuid>
		lines = (text or "").splitlines()
		user_id = None
		session_id = None
		for ln in lines:
			if ln.startswith("user_id:"):
				try:
					user_id = int(ln.split(":", 1)[1].strip())
					continue
				except Exception:
					pass
			if ln.startswith("session:"):
				session_id = ln.split(":", 1)[1].strip()
		return user_id, session_id

	async def handle_user_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE, admin_chat_id: int):  # type: ignore
		msg = update.message
		if not msg or not msg.text:
			return
		reply = get_chat_reply(msg.text)
		await msg.reply_text(reply)
		formatted = self._format_user_to_admin(msg)
		await context.bot.send_message(chat_id=admin_chat_id, text=formatted)

	async def handle_admin_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE, admin_chat_id: int):  # type: ignore
		msg = update.message
		if not msg or not msg.text:
			return
		if update.effective_chat.id != admin_chat_id:
			return
		replied_text = msg.reply_to_message.text if msg.reply_to_message and msg.reply_to_message.text else ""
		user_id_r, session_id_r = self._parse_admin_reply(replied_text)
		user_id_t, session_id_t = self._parse_admin_reply(msg.text)
		user_id = user_id_r or user_id_t
		session_id = session_id_r or session_id_t
		if session_id:
			try:
				session = WebChatSession.objects.get(id=session_id)
				m = WebChatMessage.objects.create(session=session, role="admin", content=msg.text)
				# Push via channels
				channel_layer = get_channel_layer()
				async_to_sync(channel_layer.group_send)(
					f"webchat_{session_id}",
					{"type": "chat_message", "role": "admin", "content": m.content, "created_at": m.created_at.isoformat()},
				)
			except Exception:
				pass
		if user_id is None and session_id is None:
			await msg.reply_text("user_id yoki session: <uuid> topilmadi. Reply orqali yoki matnda shu satrni yuboring.")
			return
		if user_id is not None:
			await context.bot.send_message(chat_id=user_id, text=msg.text)

	def handle(self, *args, **options):
		token = options.get("token") or os.environ.get("TELEGRAM_BOT_TOKEN")
		if not token:
			raise CommandError("Telegram token is required. Pass --token or set TELEGRAM_BOT_TOKEN env var.")
		admin_chat_id_opt = options.get("admin_chat_id") or os.environ.get("TELEGRAM_ADMIN_CHAT_ID")
		if not admin_chat_id_opt:
			raise CommandError("Admin chat id is required. Pass --admin_chat_id or set TELEGRAM_ADMIN_CHAT_ID env var.")
		try:
			admin_chat_id = int(admin_chat_id_opt)
		except Exception as exc:
			raise CommandError("Invalid admin_chat_id") from exc

		app = Application.builder().token(token).build()

		app.add_handler(CommandHandler("start", self.cmd_start))
		app.add_handler(CommandHandler("id", self.cmd_id))
		app.add_handler(MessageHandler(filters.Chat(chat_id=admin_chat_id) & filters.TEXT & ~filters.COMMAND, lambda u, c: self.handle_admin_message(u, c, admin_chat_id)))
		app.add_handler(MessageHandler(~filters.Chat(chat_id=admin_chat_id) & filters.TEXT & ~filters.COMMAND, lambda u, c: self.handle_user_message(u, c, admin_chat_id)))

		self.stdout.write(self.style.SUCCESS("Telegram bot with admin relay started."))
		app.run_polling()
