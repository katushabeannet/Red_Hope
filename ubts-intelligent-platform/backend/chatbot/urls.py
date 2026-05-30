from django.urls import path
from .views import chatbot_router_view

urlpatterns = [
    path("ask/", chatbot_router_view),
]