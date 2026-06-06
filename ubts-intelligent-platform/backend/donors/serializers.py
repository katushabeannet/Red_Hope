from rest_framework import serializers
from .models import (
    DonorProfile,
    DonorMedicalRecord,
    EligibilityAssessment,
    AvailabilityAssessment,
)


class DonorMedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonorMedicalRecord
        fields = "__all__"
        read_only_fields = ["donor", "updated_at"]


class DonorProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    medical_record = DonorMedicalRecordSerializer(read_only=True)

    class Meta:
        model = DonorProfile
        fields = "__all__"
        read_only_fields = ["user", "created_at"]


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