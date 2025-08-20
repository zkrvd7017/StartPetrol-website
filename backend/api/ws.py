from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .models import WebChatSession, WebChatMessage


class WebChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        await self.channel_layer.group_add(self.session_id, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.session_id, self.channel_name)

    async def receive_json(self, content):
        pass  # No client messages expected

    async def chat_message(self, event):
        await self.send_json(event['message'])
