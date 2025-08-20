from django.contrib import admin
from .models import Product, Review

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
