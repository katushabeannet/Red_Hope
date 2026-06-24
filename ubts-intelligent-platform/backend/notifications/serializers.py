import re
from rest_framework import serializers
from .models import Notification, BloodDemandAlert, SMSLog, WhatsAppLog

PHONE_RE = re.compile(r'^(\+256|0)[78]\d{8}$')
BLOOD_GROUPS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id", "title", "message", "notification_type",
            "target_role", "is_read", "action_label", "action_url", "created_at",
        ]


class BloodDemandAlertSerializer(serializers.ModelSerializer):
    created_by_email = serializers.SerializerMethodField()

    class Meta:
        model = BloodDemandAlert
        fields = [
            "id", "blood_group", "title", "message", "urgency_level",
            "units_needed", "hospital_name", "status", "notified_count",
            "resolved_at", "created_by_email", "created_at",
        ]

    def get_created_by_email(self, obj):
        return getattr(obj.created_by, "email", None) if obj.created_by else None

    def validate_blood_group(self, value):
        if value and value not in BLOOD_GROUPS:
            raise serializers.ValidationError(
                f"Invalid blood group. Choose from: {', '.join(sorted(BLOOD_GROUPS))}."
            )
        return value

    def validate_units_needed(self, value):
        if value is not None and not (1 <= value <= 500):
            raise serializers.ValidationError("Units needed must be between 1 and 500.")
        return value

    def validate_title(self, value):
        value = (value or "").strip()
        if len(value) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters.")
        if len(value) > 200:
            raise serializers.ValidationError("Title must be at most 200 characters.")
        return value

    def validate_message(self, value):
        value = (value or "").strip()
        if len(value) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters.")
        if len(value) > 1000:
            raise serializers.ValidationError("Message must be at most 1000 characters.")
        return value

    def validate_hospital_name(self, value):
        if value and len(value) > 200:
            raise serializers.ValidationError("Hospital name must be at most 200 characters.")
        return value


class SMSLogSerializer(serializers.ModelSerializer):
    recipient_email = serializers.SerializerMethodField()

    class Meta:
        model = SMSLog
        fields = [
            "id", "phone_number", "message", "status",
            "error_message", "recipient_email", "created_at",
        ]

    def get_recipient_email(self, obj):
        return getattr(obj.recipient, "email", None) if obj.recipient else None

    def validate_phone_number(self, value):
        if value:
            clean = re.sub(r'[\s\-()]', '', value)
            if not PHONE_RE.match(clean):
                raise serializers.ValidationError(
                    "Enter a valid Ugandan phone number (e.g. +256700123456 or 0700123456)."
                )
        return value

    def validate_message(self, value):
        if value and len(value) > 160:
            raise serializers.ValidationError("SMS message must be at most 160 characters.")
        return value


class WhatsAppLogSerializer(serializers.ModelSerializer):
    recipient_email = serializers.SerializerMethodField()

    class Meta:
        model = WhatsAppLog
        fields = [
            "id", "phone_number", "message", "template_name", "message_type",
            "status", "error_message", "wa_message_id", "recipient_email", "created_at",
        ]

    def get_recipient_email(self, obj):
        return getattr(obj.recipient, "email", None) if obj.recipient else None

    def validate_phone_number(self, value):
        if value:
            clean = re.sub(r'[\s\-()]', '', value)
            if not PHONE_RE.match(clean):
                raise serializers.ValidationError(
                    "Enter a valid Ugandan phone number (e.g. +256700123456 or 0700123456)."
                )
        return value
