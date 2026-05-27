from django.contrib import admin
from .models import DonorProfile, DonorMedicalRecord, EligibilityAssessment


@admin.register(DonorProfile)
class DonorProfileAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "phone_number",
        "blood_group",
        "gender",
        "created_at",
    ]
    search_fields = ["user__email", "phone_number", "blood_group"]
    list_filter = ["blood_group", "gender"]


@admin.register(DonorMedicalRecord)
class DonorMedicalRecordAdmin(admin.ModelAdmin):
    list_display = [
        "donor",
        "weight_kg",
        "hemoglobin_level",
        "has_recent_illness",
        "has_chronic_condition",
        "last_donation_date",
        "updated_at",
    ]
    search_fields = ["donor__user__email"]
    list_filter = [
        "has_recent_illness",
        "has_chronic_condition",
        "is_pregnant",
        "is_on_medication",
    ]
    
    
@admin.register(EligibilityAssessment)
class EligibilityAssessmentAdmin(admin.ModelAdmin):
    list_display = ["donor", "is_eligible", "age", "assessed_at"]
    list_filter = ["is_eligible", "assessed_at"]
    search_fields = ["donor__user__email"]