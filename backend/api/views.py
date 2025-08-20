# ...existing code...
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from .models import Product, Review, WebChatSession, WebChatMessage
from .serializers import ProductSerializer, ReviewSerializer, WebChatSessionSerializer, WebChatMessageSerializer
from .chat_logic import get_chat_reply
from channels.layers import get_channel_layer
import os
# ...existing code...
# (remove the duplicate plain `webchat_send` function that only printed the message)
# ...existing code...
try:
	from openai import OpenAI  # type: ignore
except Exception:  # pragma: no cover
	OpenAI = None  # type: ignore

try:
	from telegram import Bot  # type: ignore
except Exception:
	Bot = None  # type: ignore


class ProductViewSet(viewsets.ModelViewSet):
	serializer_class = ProductSerializer
	permission_classes = [AllowAny]

	def get_queryset(self):
		qs = Product.objects.all()
		type_param = self.request.query_params.get("type")
		if type_param:
			qs = qs.filter(type=type_param)
		q = self.request.query_params.get("q")
		if q:
			qs = qs.filter(name__icontains=q)
		return qs


class ReviewViewSet(viewsets.ModelViewSet):
	queryset = Review.objects.all()
	serializer_class = ReviewSerializer
	permission_classes = [AllowAny]


class ChatView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		message = str(request.data.get("message") or "")
		reply = get_chat_reply(message)
		return Response({"reply": reply})


@api_view(["POST"])
@permission_classes([AllowAny])
def webchat_session(request):
	user_id = str(request.data.get("user_id") or "").strip()
	session = WebChatSession.objects.create(user_id=user_id)
	return Response(WebChatSessionSerializer(session).data)


def _send_to_admin_via_telegram(text: str) -> None:
	admin_chat = os.environ.get("TELEGRAM_ADMIN_CHAT_ID")
	token = os.environ.get("TELEGRAM_BOT_TOKEN")
	if not (admin_chat and token and Bot):
		return
	try:
		bot = Bot(token=token)
		bot.send_message(chat_id=int(admin_chat), text=text)
	except Exception:
		pass


@api_view(["POST"])
@permission_classes([AllowAny])
def webchat_send(request, session_id: str):
	try:
		session = WebChatSession.objects.get(id=session_id)
	except WebChatSession.DoesNotExist:
		return Response({"detail": "Session not found"}, status=404)
	content = str(request.data.get("content") or "").strip()
	if not content:
		return Response({"detail": "Empty"}, status=400)
	msg = WebChatMessage.objects.create(session=session, role="user", content=content)
	prefix = f"#web\nsession:{session.id}\n"
	if session.user_id:
		prefix = f"#web\nuser_id:{session.user_id}\nsession:{session.id}\n"
	_send_to_admin_via_telegram(prefix + content)
	return Response(WebChatMessageSerializer(msg).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def webchat_poll(request, session_id: str):
	try:
		session = WebChatSession.objects.get(id=session_id)
	except WebChatSession.DoesNotExist:
		return Response({"detail": "Session not found"}, status=404)
	last_ts = request.query_params.get("since")
	qs = session.messages.all()
	if last_ts:
		qs = qs.filter(created_at__gt=last_ts)
	return Response(WebChatMessageSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def send_question(request):
	session_id = request.data.get("session_id")
	user_id = str(request.data.get("user_id") or "").strip()
	content = str(request.data.get("content") or "").strip()
	if not content:
		return Response({"detail": "Empty"}, status=400)
	if session_id:
		try:
			session = WebChatSession.objects.get(id=session_id)
			if user_id and not session.user_id:
				session.user_id = user_id
				session.save(update_fields=["user_id"]) 
		except WebChatSession.DoesNotExist:
			session = WebChatSession.objects.create(user_id=user_id)
	else:
		session = WebChatSession.objects.create(user_id=user_id)
	WebChatMessage.objects.create(session=session, role="user", content=content)
	prefix = f"#web\nsession:{session.id}\n"
	if session.user_id:
		prefix = f"#web\nuser_id:{session.user_id}\nsession:{session.id}\n"
	_send_to_admin_via_telegram(prefix + content)
	return Response({"session_id": str(session.id), "status": "sent"})

def webchat_send(request, session_id: str):
    content = str(request.data.get("content") or "").strip()
    print(f"Foydalanuvchi xabari: {content}")

@api_view(["POST"])
@permission_classes([AllowAny])
def receive_answer(request):
	api_key = request.data.get("api_key")
	if settings.WEBCHAT_API_KEY and api_key != settings.WEBCHAT_API_KEY:
		return Response({"detail": "Unauthorized"}, status=401)
	session_id = request.data.get("session_id")
	content = str(request.data.get("content") or "").strip()
	if not (session_id and content):
		return Response({"detail": "Invalid"}, status=400)
	try:
		session = WebChatSession.objects.get(id=session_id)
	except WebChatSession.DoesNotExist:
		return Response({"detail": "Session not found"}, status=404)
	m = WebChatMessage.objects.create(session=session, role="admin", content=content)
	try:
		from asgiref.sync import async_to_sync
		from channels.layers import get_channel_layer 
		webchat_send(request, session_id)
		channel_layer = get_channel_layer()
		async_to_sync(channel_layer.group_send)(f"webchat_{session_id}", {"type": "chat_message", "role": "admin", "content": m.content, "created_at": m.created_at.isoformat()})
	except Exception:
		pass
	return Response({"status": "ok"})
