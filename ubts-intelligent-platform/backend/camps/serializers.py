import re
from rest_framework import serializers
from .models import DonationCamp

PHONE_RE = re.compile(r'^(\+256|0)[78]\d{8}$')


class DonationCampSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationCamp
        fields = "__all__"

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Camp name must be at least 3 characters.")
        if len(value) > 100:
            raise serializers.ValidationError("Camp name must be at most 100 characters.")
        return value

    def validate_venue(self, value):
        value = (value or "").strip()
        if value and len(value) < 3:
            raise serializers.ValidationError("Venue must be at least 3 characters.")
        if len(value) > 200:
            raise serializers.ValidationError("Venue must be at most 200 characters.")
        return value

    def validate_latitude(self, value):
        if value is not None and not (-90 <= float(value) <= 90):
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_longitude(self, value):
        if value is not None and not (-180 <= float(value) <= 180):
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value

    def validate_contact_phone(self, value):
        if value:
            clean = re.sub(r'[\s\-()]', '', value)
            if not PHONE_RE.match(clean):
                raise serializers.ValidationError(
                    "Enter a valid Ugandan phone number (e.g. +256700123456 or 0700123456)."
                )
        return value

    def validate_description(self, value):
        if value and len(value) > 1000:
            raise serializers.ValidationError("Description must be at most 1000 characters.")
        return value

    def validate(self, data):
        start = data.get("start_date")
        end = data.get("end_date")
        if start and end and end < start:
            raise serializers.ValidationError({"end_date": "End date must be on or after the start date."})
        return data
