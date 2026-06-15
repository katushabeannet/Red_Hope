from django.contrib import admin

from .models import Notification, BloodDemandAlert


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "recipient",
        "notification_type",
        "target_role",
        "is_read",
        "created_at",
    ]
    list_filter = ["notification_type", "target_role", "is_read", "created_at"]
    search_fields = ["title", "message", "recipient__email", "recipient__full_name"]


@admin.register(BloodDemandAlert)
class BloodDemandAlertAdmin(admin.ModelAdmin):
    list_display = [
        "blood_group",
        "title",
        "status",
        "created_by",
        "created_at",
    ]
    list_filter = ["blood_group", "status", "created_at"]
    search_fields = ["blood_group", "title", "message"]