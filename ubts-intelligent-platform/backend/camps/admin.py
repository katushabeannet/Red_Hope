from django.contrib import admin
from .models import DonationCamp


@admin.register(DonationCamp)
class DonationCampAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "district",
        "venue",
        "status",
        "start_date",
        "end_date",
    ]
    search_fields = ["name", "district", "venue"]
    list_filter = ["status", "district", "region"]