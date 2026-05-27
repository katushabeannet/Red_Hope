from django.urls import path
from .views import active_camps_view, nearest_camp_view, admin_camps_view

urlpatterns = [
    path("active/", active_camps_view),
    path("nearest/", nearest_camp_view),
    path("admin/", admin_camps_view),
]