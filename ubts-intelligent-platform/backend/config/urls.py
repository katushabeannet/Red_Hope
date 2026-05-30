from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/donors/", include("donors.urls")),
    path("api/camps/", include("camps.urls")),
    path("api/chatbot/", include("chatbot.urls")),
    path("api/admin/", include("campaigns.urls")),
]