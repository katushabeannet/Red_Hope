from django.urls import path
from .views import (
    donor_profile_view,
    donor_medical_record_view,
    eligibility_check_view,
    availability_check_view,
    campaign_ready_donors_view,
    admin_donors_list_view,
    admin_medical_record_manage_view,
    update_profile_view,
)

urlpatterns = [
    path("profile/", donor_profile_view),
    path("medical-record/", donor_medical_record_view),
    path("eligibility-check/", eligibility_check_view),
    path("availability-check/", availability_check_view),
    path("admin/campaign-ready/", campaign_ready_donors_view),
    path("admin/donors/", admin_donors_list_view),
    path("admin/medical-record/", admin_medical_record_manage_view),
    path(
    "profile/update/",
    update_profile_view,
),
]