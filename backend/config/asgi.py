import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

django_asgi_app = get_asgi_application()

from api.ws import WebChatConsumer  # noqa: E402

application = ProtocolTypeRouter({
	"http": django_asgi_app,
	"websocket": URLRouter([
		path("ws/webchat/<uuid:session_id>/", WebChatConsumer.as_asgi()),
	]),
})
