from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    list_display = ["email", "username", "full_name", "role", "is_staff"]
    list_filter = ["role", "is_staff", "is_superuser"]

    fieldsets = UserAdmin.fieldsets + (
        ("UBTS Role Information", {"fields": ("full_name", "role")}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("UBTS Role Information", {"fields": ("email", "full_name", "role")}),
    )