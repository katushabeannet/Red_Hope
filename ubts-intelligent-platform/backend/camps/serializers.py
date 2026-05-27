from rest_framework import serializers
from .models import DonationCamp


class DonationCampSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationCamp
        fields = "__all__"