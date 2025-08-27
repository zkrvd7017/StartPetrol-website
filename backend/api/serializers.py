from rest_framework import serializers
from .models import Product, Review, WebChatSession, WebChatMessage, Station, FuelPrice


class ReviewSerializer(serializers.ModelSerializer):
	product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), required=False)
	product_name = serializers.CharField(write_only=True, required=False)
	product_label = serializers.CharField(source="product.name", read_only=True)

	class Meta:
		model = Review
		fields = ["id", "name", "rating", "comment", "date", "product", "product_name", "product_label"]

	def validate(self, attrs):
		product = attrs.get("product")
		product_name = attrs.pop("product_name", None)
		if product is None and product_name:
			try:
				attrs["product"] = Product.objects.get(name__iexact=product_name)
			except Product.DoesNotExist:
				raise serializers.ValidationError({"product": "Product not found"})
		if attrs.get("product") is None:
			raise serializers.ValidationError({"product": "This field is required."})
		return attrs

	def create(self, validated_data):
		# product resolved in validate
		return super().create(validated_data)


class ProductSerializer(serializers.ModelSerializer):
	reviews = ReviewSerializer(many=True, read_only=True)

	class Meta:
		model = Product
		fields = [
			"id",
			"name",
			"type",
			"description",
			"delivery",
			"volume",
			"quality",
			"rating",
			"image_url",
			"reviews",
		]


class WebChatMessageSerializer(serializers.ModelSerializer):
	class Meta:
		model = WebChatMessage
		fields = ["id", "role", "content", "created_at"]


class WebChatSessionSerializer(serializers.ModelSerializer):
	messages = WebChatMessageSerializer(many=True, read_only=True)

	class Meta:
		model = WebChatSession
		fields = ["id", "messages", "created_at"]


class FuelPriceSerializer(serializers.ModelSerializer):
	product_name = serializers.CharField(source="product.name", read_only=True)
	product_type = serializers.CharField(source="product.type", read_only=True)

	class Meta:
		model = FuelPrice
		fields = ["id", "product", "product_name", "product_type", "price", "available", "updated_at"]


class StationSerializer(serializers.ModelSerializer):
	prices = FuelPriceSerializer(many=True, read_only=True)

	class Meta:
		model = Station
		fields = [
			"id",
			"name",
			"address",
			"latitude",
			"longitude",
			"phone",
			"hours",
			"prices",
		]
