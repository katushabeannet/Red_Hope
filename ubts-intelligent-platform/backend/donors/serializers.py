from rest_framework import serializers
from .models import DonorProfile, DonorMedicalRecord


class DonorMedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonorMedicalRecord
        fields = "__all__"
        read_only_fields = ["donor", "updated_at"]


class DonorProfileSerializer(serializers.ModelSerializer):
    medical_record = DonorMedicalRecordSerializer(read_only=True)

    class Meta:
        model = DonorProfile
        fields = "__all__"
        read_only_fields = ["user", "created_at"]