from django.conf import settings
from django.db import models


class DonorProfile(models.Model):
    class BloodGroup(models.TextChoices):
        A_POSITIVE = "A+", "A+"
        A_NEGATIVE = "A-", "A-"
        B_POSITIVE = "B+", "B+"
        B_NEGATIVE = "B-", "B-"
        AB_POSITIVE = "AB+", "AB+"
        AB_NEGATIVE = "AB-", "AB-"
        O_POSITIVE = "O+", "O+"
        O_NEGATIVE = "O-", "O-"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="donor_profile"
    )
    phone_number = models.CharField(max_length=20, blank=True)
    blood_group = models.CharField(max_length=5, choices=BloodGroup.choices)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.blood_group}"


class DonorMedicalRecord(models.Model):
    donor = models.OneToOneField(
        DonorProfile,
        on_delete=models.CASCADE,
        related_name="medical_record"
    )

    weight_kg = models.FloatField(null=True, blank=True)
    hemoglobin_level = models.FloatField(null=True, blank=True)
    has_recent_illness = models.BooleanField(default=False)
    has_chronic_condition = models.BooleanField(default=False)
    last_donation_date = models.DateField(null=True, blank=True)

    is_pregnant = models.BooleanField(default=False)
    is_on_medication = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Medical record for {self.donor.user.email}"
    
    
    
class EligibilityAssessment(models.Model):
    donor = models.ForeignKey(
        DonorProfile,
        on_delete=models.CASCADE,
        related_name="eligibility_assessments"
    )
    is_eligible = models.BooleanField()
    age = models.IntegerField(null=True, blank=True)
    reasons = models.JSONField(default=list)
    summary = models.TextField()
    assessed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Eligibility for {self.donor.user.email} - {self.is_eligible}"