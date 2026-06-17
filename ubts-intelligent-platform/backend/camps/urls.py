from django.urls import path
from .views import active_camps_view, nearest_camp_view, admin_camps_view, reschedule_camp_view

urlpatterns = [
    path("active/", active_camps_view),
    path("nearest/", nearest_camp_view),
    path("admin/", admin_camps_view),
    path("admin/<int:camp_id>/reschedule/", reschedule_camp_view),
]