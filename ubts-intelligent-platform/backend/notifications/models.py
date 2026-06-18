from django.conf import settings
from django.db import models


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        RETENTION = "RETENTION", "Retention Reminder"
        BADGE = "BADGE", "Badge Earned"
        CAMP = "CAMP", "Nearby Camp"
        BLOOD_DEMAND = "BLOOD_DEMAND", "Blood Demand"
        SYSTEM = "SYSTEM", "System"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=150)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
    )
    target_role = models.CharField(max_length=20, default="DONOR")
    is_read = models.BooleanField(default=False)
    action_label = models.CharField(max_length=100, blank=True)
    action_url = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.recipient}"


class SMSLog(models.Model):
    class Status(models.TextChoices):
        SENT = "SENT", "Sent"
        FAILED = "FAILED", "Failed"
        SKIPPED = "SKIPPED", "Skipped"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sms_logs",
    )
    phone_number = models.CharField(max_length=30)
    message = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SKIPPED)
    error_message = models.TextField(blank=True)
    response_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"SMS to {self.phone_number} — {self.status}"


class SMSSetting(models.Model):
    sms_enabled = models.BooleanField(default=False)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "SMS Setting"

    def __str__(self):
        return f"SMS {'enabled' if self.sms_enabled else 'disabled'}"

    @classmethod
    def get_setting(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj


class WhatsAppLog(models.Model):
    class Status(models.TextChoices):
        SENT = "SENT", "Sent"
        FAILED = "FAILED", "Failed"
        SKIPPED = "SKIPPED", "Skipped"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="whatsapp_logs",
    )
    phone_number = models.CharField(max_length=30)
    message = models.TextField()
    template_name = models.CharField(max_length=100, blank=True)
    message_type = models.CharField(max_length=20, default="text")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SKIPPED)
    error_message = models.TextField(blank=True)
    response_data = models.JSONField(null=True, blank=True)
    wa_message_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"WhatsApp to {self.phone_number} — {self.status}"


class WhatsAppSetting(models.Model):
    whatsapp_enabled = models.BooleanField(default=False)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "WhatsApp Setting"

    def __str__(self):
        return f"WhatsApp {'enabled' if self.whatsapp_enabled else 'disabled'}"

    @classmethod
    def get_setting(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj


class BloodDemandAlert(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        RESOLVED = "RESOLVED", "Resolved"

    class UrgencyLevel(models.TextChoices):
        CRITICAL = "CRITICAL", "Critical"
        HIGH = "HIGH", "High"
        MEDIUM = "MEDIUM", "Medium"
        LOW = "LOW", "Low"

    blood_group = models.CharField(max_length=5)
    title = models.CharField(max_length=150)
    message = models.TextField()
    urgency_level = models.CharField(
        max_length=10,
        choices=UrgencyLevel.choices,
        default=UrgencyLevel.HIGH,
    )
    units_needed = models.PositiveIntegerField(default=1)
    hospital_name = models.CharField(max_length=200, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    notified_count = models.PositiveIntegerField(default=0)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="blood_demand_alerts",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.urgency_level}] {self.blood_group} - {self.title}"
