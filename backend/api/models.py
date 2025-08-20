from django.db import models
from uuid import uuid4


class Product(models.Model):
	TYPE_CHOICES = (
		("benzin", "Benzin"),
		("dizel", "Dizel"),
		("neft", "Neft"),
	)

	name = models.CharField(max_length=200)
	type = models.CharField(max_length=20, choices=TYPE_CHOICES)
	description = models.TextField(blank=True)
	delivery = models.CharField(max_length=200, blank=True)
	volume = models.CharField(max_length=100, blank=True)
	quality = models.CharField(max_length=100, blank=True)
	rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
	image_url = models.URLField(blank=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ("-created_at",)

	def __str__(self) -> str:
		return self.name


class Review(models.Model):
	product = models.ForeignKey(Product, related_name="reviews", on_delete=models.CASCADE)
	name = models.CharField(max_length=120)
	rating = models.PositiveSmallIntegerField(default=5)
	comment = models.TextField()
	date = models.DateField(auto_now_add=True)

	class Meta:
		ordering = ("-id",)

	def __str__(self) -> str:
		return f"{self.name} - {self.product.name}"


class WebChatSession(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
	user_id = models.CharField(max_length=64, blank=True, default="")
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self) -> str:
		return str(self.id)


class WebChatMessage(models.Model):
	ROLE_CHOICES = (("user", "user"), ("admin", "admin"))
	session = models.ForeignKey(WebChatSession, related_name="messages", on_delete=models.CASCADE)
	role = models.CharField(max_length=10, choices=ROLE_CHOICES)
	content = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ("created_at",)

	def __str__(self) -> str:
		return f"{self.session_id} {self.role}: {self.content[:20]}"
