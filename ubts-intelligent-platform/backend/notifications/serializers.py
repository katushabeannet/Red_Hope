from rest_framework import serializers

from .models import Notification, BloodDemandAlert, SMSLog


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


class SMSLogSerializer(serializers.ModelSerializer):
    recipient_email = serializers.SerializerMethodField()

    class Meta:
        model = SMSLog
        fields = [
            "id",
            "phone_number",
            "message",
            "status",
            "error_message",
            "recipient_email",
            "created_at",
        ]

    def get_recipient_email(self, obj):
        return getattr(obj.recipient, "email", None) if obj.recipient else None