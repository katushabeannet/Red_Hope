from django.conf import settings
from django.db import models


class CampaignPerformance(models.Model):
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    radius_km = models.FloatField(default=10)

    campaign_latitude = models.FloatField(null=True, blank=True)
    campaign_longitude = models.FloatField(null=True, blank=True)

    total_matches = models.PositiveIntegerField(default=0)
    available_donors = models.PositiveIntegerField(default=0)
    unavailable_donors = models.PositiveIntegerField(default=0)

    high_priority_donors = models.PositiveIntegerField(default=0)
    medium_priority_donors = models.PositiveIntegerField(default=0)
    low_priority_donors = models.PositiveIntegerField(default=0)

    ineligible_donors = models.PositiveIntegerField(default=0)
    outside_radius_donors = models.PositiveIntegerField(default=0)
    skipped_donors = models.PositiveIntegerField(default=0)

    average_availability_score = models.FloatField(default=0)
    average_campaign_priority_score = models.FloatField(default=0)

    contacted_donors = models.PositiveIntegerField(default=0)
    converted_donors = models.PositiveIntegerField(default=0)
    campaign_name = models.CharField(max_length=200, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="campaign_performance_records",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        blood_group = self.blood_group or "All Blood Groups"
        return f"{blood_group} Campaign Scan - {self.created_at}"