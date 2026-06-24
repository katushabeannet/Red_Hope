import re
from datetime import date
from rest_framework import serializers
from .models import (
    DonorProfile,
    DonorMedicalRecord,
    EligibilityAssessment,
    AvailabilityAssessment,
)

PHONE_RE = re.compile(r'^(\+256|0)[78]\d{8}$')
BLOOD_GROUPS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}


class DonorMedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonorMedicalRecord
        fields = "__all__"
        read_only_fields = ["donor", "updated_at"]

    def validate_weight_kg(self, value):
        if value is not None and not (30 <= value <= 250):
            raise serializers.ValidationError("Weight must be between 30 and 250 kg.")
        return value

    def validate_hemoglobin_level(self, value):
        if value is not None and not (4.0 <= float(value) <= 22.0):
            raise serializers.ValidationError("Hemoglobin level must be between 4 and 22 g/dL.")
        return value


class DonorProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    medical_record = DonorMedicalRecordSerializer(read_only=True)

    class Meta:
        model = DonorProfile
        fields = "__all__"
        read_only_fields = ["user", "created_at"]

    def validate_phone_number(self, value):
        if value:
            clean = re.sub(r'[\s\-()]', '', value)
            if not PHONE_RE.match(clean):
                raise serializers.ValidationError(
                    "Enter a valid Ugandan phone number (e.g. +256700123456 or 0700123456)."
                )
        return value

    def validate_blood_group(self, value):
        if value and value not in BLOOD_GROUPS:
            raise serializers.ValidationError(
                f"Invalid blood group. Choose from: {', '.join(sorted(BLOOD_GROUPS))}."
            )
        return value

    def validate_date_of_birth(self, value):
        if value:
            today = date.today()
            age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
            if age < 18:
                raise serializers.ValidationError("Donor must be at least 18 years old.")
            if age > 65:
                raise serializers.ValidationError("Donor age must not exceed 65 years.")
        return value

    def validate_address(self, value):
        if value and len(value) > 200:
            raise serializers.ValidationError("Address must be at most 200 characters.")
        return value


class EligibilityAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EligibilityAssessment
        fields = "__all__"
        read_only_fields = ["donor", "assessed_at"]


class AvailabilityAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilityAssessment
        fields = "__all__"
        read_only_fields = ["donor", "assessed_at"]
