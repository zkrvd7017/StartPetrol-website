from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
	help = "Create demo admin and multiple demo users"

	def handle(self, *args, **options):
		User = get_user_model()

		accounts = [
			{"username": "admin", "email": "admin@example.com", "password": "admin123", "is_superuser": True, "is_staff": True},
			{"username": "demo", "email": "demo@example.com", "password": "demo12345"},
			{"username": "akmal.karimov", "email": "akmal.karimov@example.com", "password": "Passw0rd!"},
			{"username": "nodira.azimova", "email": "nodira.azimova@example.com", "password": "Passw0rd!"},
			{"username": "bobur.tursunov", "email": "bobur.tursunov@example.com", "password": "Passw0rd!"},
			{"username": "dilshod.rasulov", "email": "dilshod.rasulov@example.com", "password": "Passw0rd!"},
			{"username": "madina.olimova", "email": "madina.olimova@example.com", "password": "Passw0rd!"},
			{"username": "javlon.bek", "email": "javlon.bek@example.com", "password": "Passw0rd!"},
			{"username": "shahnoza.yuldasheva", "email": "shahnoza.yuldasheva@example.com", "password": "Passw0rd!"},
			{"username": "umid.ergashev", "email": "umid.ergashev@example.com", "password": "Passw0rd!"},
		]

		for acc in accounts:
			if not User.objects.filter(username=acc["username"]).exists():
				if acc.get("is_superuser"):
					User.objects.create_superuser(acc["username"], acc["email"], acc["password"])  # type: ignore
				else:
					User.objects.create_user(acc["username"], acc["email"], acc["password"])  # type: ignore
				self.stdout.write(self.style.SUCCESS(f"Created {acc['username']}"))
			else:
				self.stdout.write(f"{acc['username']} already exists")
