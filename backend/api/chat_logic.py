import os
from .models import Product

try:
	from openai import OpenAI  # type: ignore
except Exception:  # pragma: no cover
	OpenAI = None  # type: ignore


def get_chat_reply(message_raw: str) -> str:
	message = (message_raw or "").strip()
	if not message:
		return "Savolingizni kiriting, yordam beraman."

	api_key = os.environ.get("OPENAI_API_KEY")
	if api_key and OpenAI is not None:
		try:
			client = OpenAI(api_key=api_key)
			products_list = list(Product.objects.values_list("name", flat=True)[:10])
			context = (
				"Siz yoqilg'i va neft mahsulotlari bo'yicha yordamchi botsiz. "
				"Qisqa va aniq javob bering. Zarur bo'lsa savolga aniqlik kiriting. "
				"Mavjud mahsulotlar: " + ", ".join(products_list) + ". "
				"Yetkazib berish 24/7, Toshkent ~2 soat, viloyat ~24 soat. Telefon: +998 90 123 45 67."
			)
			resp = client.chat.completions.create(
				model="gpt-4o-mini",
				messages=[
					{"role": "system", "content": context},
					{"role": "user", "content": message},
				],
				temperature=0.2,
				max_tokens=256,
			)
			answer = resp.choices[0].message.content if resp and resp.choices else None  # type: ignore
			if answer:
				return str(answer)
		except Exception:
			pass

	m_lower = message.lower()
	if any(k in m_lower for k in ["narx", "price", "narxi", "qiymat"]):
		return "Narxlar mahsulot turi va buyurtma hajmiga qarab belgilanadi. Aniqlashtirish uchun +998 90 123 45 67 raqamiga murojaat qiling yoki buyurtma tafsilotlarini yuboring."
	if any(k in m_lower for k in ["yetkaz", "delivery", "yetkazib"]):
		return "Toshkent bo'ylab ~2 soat, viloyatlar bo'ylab ~24 soatda yetkazib beramiz. 24/7 buyurtmalar qabul qilinadi."
	if any(k in m_lower for k in ["ish vaqti", "ishlash vaqti", "24/7", "24x7"]):
		return "Biz 24/7 ishlaymiz. Istalgan paytda murojaat qilishingiz mumkin."

	keywords = ["ai-95", "ai95", "95", "ai-92", "ai92", "92", "benzin", "dizel", "neft"]
	if any(k in m_lower for k in keywords):
		qs = Product.objects.all()
		if "dizel" in m_lower:
			qs = qs.filter(type="dizel")
		elif any(k in m_lower for k in ["benzin", "ai", "95", "92"]):
			qs = qs.filter(type="benzin")
		elif "neft" in m_lower:
			qs = qs.filter(type="neft")
		names = list(qs.values_list("name", flat=True)[:5])
		if names:
			return "Quyidagi mahsulotlar mos bo'lishi mumkin: " + ", ".join(names) + ". Batafsil uchun katalog bo'limidan tanlang yoki hajm/manzil yuboring."

	return "Savolingizni aniqroq yozing (mahsulot turi, kerakli hajm, manzil). Yetkazib berish 24/7. Qo'shimcha ma'lumot: +998 90 123 45 67."
