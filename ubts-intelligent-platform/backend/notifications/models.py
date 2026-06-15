from django.conf import settings
from django.db import models


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        RETENTION = "RETENTION", "Retention Reminder"
        BADGE = "BADGE", "Badge Earned"
        CAMP = "CAMP", "Nearby Camp"
        BLOOD_DEMAND = "BLOOD_DEMAND", "Blood Demand"
        SYSTEM = "SYSTEM", "System"

    class TargetRole(models.TextChoices):
        DONOR = "DONOR", "Donor"
        ADMIN = "ADMIN", "Admin"
        BOTH = "BOTH", "Both"

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
    target_role = models.CharField(
        max_length=20,
        choices=TargetRole.choices,
        default=TargetRole.DONOR,
    )

    is_read = models.BooleanField(default=False)
    action_label = models.CharField(max_length=100, blank=True)
    action_url = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.recipient}"