from rest_framework import serializers

from .models import Notification, BloodDemandAlert


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "notification_type",
            "target_role",
            "is_read",
            "action_label",
            "action_url",
            "created_at",
        ]


class BloodDemandAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodDemandAlert
        fields = [
            "id",
            "blood_group",
            "title",
            "message",
            "status",
            "created_at",
        ]