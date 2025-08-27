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
		return f"{self.session.id} {self.role}: {self.content[:20]}"


# Stations and fuel prices
class Station(models.Model):
	name = models.CharField(max_length=200)
	address = models.CharField(max_length=300, blank=True)
	latitude = models.DecimalField(max_digits=9, decimal_places=6)
	longitude = models.DecimalField(max_digits=9, decimal_places=6)
	phone = models.CharField(max_length=50, blank=True)
	hours = models.CharField(max_length=120, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ("name",)

	def __str__(self) -> str:
		return self.name


class FuelPrice(models.Model):
	station = models.ForeignKey(Station, related_name="prices", on_delete=models.CASCADE)
	product = models.ForeignKey(Product, related_name="station_prices", on_delete=models.CASCADE)
	price = models.DecimalField(max_digits=10, decimal_places=2)
	available = models.BooleanField(default=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		unique_together = ("station", "product")

	def __str__(self) -> str:
		return f"{self.station.name} - {self.product.name}: {self.price}"
