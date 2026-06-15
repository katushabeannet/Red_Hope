from django.urls import path

from .views import (
    my_notifications_view,
    generate_my_notifications_view,
    mark_notification_read_view,
    mark_all_notifications_read_view,
    admin_notifications_view,
)


urlpatterns = [
    path("my/", my_notifications_view),
    path("generate-my/", generate_my_notifications_view),
    path("<int:notification_id>/read/", mark_notification_read_view),
    path("read-all/", mark_all_notifications_read_view),
    path("admin/", admin_notifications_view),
]