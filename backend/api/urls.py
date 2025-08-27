from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ProductViewSet, ReviewViewSet, ChatView, webchat_session, webchat_send, webchat_poll, send_question, receive_answer, StationViewSet, FuelPriceViewSet

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")
router.register(r"reviews", ReviewViewSet, basename="review")
router.register(r"stations", StationViewSet, basename="station")
router.register(r"fuel-prices", FuelPriceViewSet, basename="fuelprice")

urlpatterns = [
	path("", include(router.urls)),
	path("chat/", ChatView.as_view(), name="chat"),
	path("webchat/session/", webchat_session, name="webchat_session"),
	path("webchat/<uuid:session_id>/send/", webchat_send, name="webchat_send"),
	path("webchat/<uuid:session_id>/poll/", webchat_poll, name="webchat_poll"),
	# TZ aliases
	path("send-question", send_question, name="send_question"),
	path("send-question/", send_question),
	path("receive-answer", receive_answer, name="receive_answer"),
	path("receive-answer/", receive_answer),
]
