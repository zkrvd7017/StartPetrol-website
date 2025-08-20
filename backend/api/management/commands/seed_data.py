from django.core.management.base import BaseCommand
from api.models import Product, Review


class Command(BaseCommand):
	help = "Seed initial products and sample reviews"

	def handle(self, *args, **options):
		data = [
			{
				"name": "Premium Benzin AI-95",
				"type": "benzin",
				"description": "Yuqori sifatli premium benzin avtomobillar uchun",
				"delivery": "Bepul yetkazib berish",
				"volume": "1000L gacha",
				"quality": "Premium",
				"rating": 4.9,
				"image_url": "",
			},
			{
				"name": "Dizel Yoqilg'isi",
				"type": "dizel",
				"description": "Professional dizel transport vositalari uchun",
				"delivery": "24/7 yetkazib berish",
				"volume": "5000L gacha",
				"quality": "Industrial",
				"rating": 4.8,
				"image_url": "",
			},
			{
				"name": "Premium Benzin AI-92",
				"type": "benzin",
				"description": "Standart avtomobillar uchun sifatli benzin",
				"delivery": "Tez yetkazib berish",
				"volume": "2000L gacha",
				"quality": "Standard",
				"rating": 4.7,
				"image_url": "",
			},
			{
				"name": "Sanoat Neft Mahsuloti",
				"type": "neft",
				"description": "Sanoat korxonalari uchun maxsus neft mahsuloti",
				"delivery": "Maxsus yetkazib berish",
				"volume": "10000L gacha",
				"quality": "Industrial Pro",
				"rating": 5.0,
				"image_url": "",
			},
		]

		created = 0
		for item in data:
			product, was_created = Product.objects.get_or_create(name=item["name"], defaults=item)
			created += 1 if was_created else 0

		self.stdout.write(self.style.SUCCESS(f"Seeded {created} products (or already existed)."))

		# Sample reviews for first product
		first = Product.objects.first()
		if first and not first.reviews.exists():
			Review.objects.create(product=first, name="Akmal Karimov", rating=5, comment="Benzin sifati juda yaxshi, avtomobilim yaxshi ishlaydi. Yetkazib berish ham tez.")
			Review.objects.create(product=first, name="Nodira Azimova", rating=4, comment="Dizel sifati yaxshi, lekin narx biroz qimmat.")
			self.stdout.write(self.style.SUCCESS("Added sample reviews."))
