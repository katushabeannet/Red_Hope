from django.db import models


class DonationCamp(models.Model):
    class CampStatus(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"
        COMPLETED = "COMPLETED", "Completed"

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)

    region = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    venue = models.CharField(max_length=200)

    latitude = models.FloatField()
    longitude = models.FloatField()

    start_date = models.DateField()
    end_date = models.DateField()

    contact_phone = models.CharField(max_length=20, blank=True)
    status = models.CharField(
        max_length=20,
        choices=CampStatus.choices,
        default=CampStatus.ACTIVE
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_date", "name"]

    def __str__(self):
        return f"{self.name} - {self.district}"