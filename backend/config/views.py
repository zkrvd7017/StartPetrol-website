from django.http import JsonResponse

def home_view(request):
    """Asosiy sahifa uchun view"""
    return JsonResponse({
        "message": "StartPetrol Backend API is running",
        "status": "success",
        "version": "1.0.0",
        "endpoints": {
            "admin": "/admin/",
            "api": "/api/",
            "products": "/api/products/",
            "stations": "/api/stations/",
            "reviews": "/api/reviews/"
        }
    })
