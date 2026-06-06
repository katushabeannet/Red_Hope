from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "email", "username", "full_name", "role", "password"]

    def create(self, validated_data):
        password = validated_data.pop("password")

        if not validated_data.get("username"):
            validated_data["username"] = validated_data["email"].split("@")[0]

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "full_name", "role"]