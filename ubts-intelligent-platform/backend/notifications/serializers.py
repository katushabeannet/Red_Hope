from rest_framework import serializers

from .models import Notification, BloodDemandAlert, SMSLog, WhatsAppLog


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
    created_by_email = serializers.SerializerMethodField()

    class Meta:
        model = BloodDemandAlert
        fields = [
            "id",
            "blood_group",
            "title",
            "message",
            "urgency_level",
            "units_needed",
            "hospital_name",
            "status",
            "notified_count",
            "resolved_at",
            "created_by_email",
            "created_at",
        ]

    def get_created_by_email(self, obj):
        return getattr(obj.created_by, "email", None) if obj.created_by else None


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


class WhatsAppLogSerializer(serializers.ModelSerializer):
    recipient_email = serializers.SerializerMethodField()

    class Meta:
        model = WhatsAppLog
        fields = [
            "id",
            "phone_number",
            "message",
            "template_name",
            "message_type",
            "status",
            "error_message",
            "wa_message_id",
            "recipient_email",
            "created_at",
        ]

    def get_recipient_email(self, obj):
        return getattr(obj.recipient, "email", None) if obj.recipient else None