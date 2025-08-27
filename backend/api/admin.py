from django.contrib import admin
from .models import Product, Review, Station, FuelPrice

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "type", "quality", "rating")
	search_fields = ("name",)
	list_filter = ("type", "quality")

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "product", "rating", "date")
	search_fields = ("name", "comment")
	list_filter = ("rating",)

@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "address", "latitude", "longitude")
	search_fields = ("name", "address")

@admin.register(FuelPrice)
class FuelPriceAdmin(admin.ModelAdmin):
	list_display = ("id", "station", "product", "price", "available", "updated_at")
	list_filter = ("available", "product__type")
	search_fields = ("station__name", "product__name")
