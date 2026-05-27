from django.urls import path
from .views import (
    donor_profile_view,
    donor_medical_record_view,
    eligibility_check_view,
    availability_check_view,
)

urlpatterns = [
    path("profile/", donor_profile_view),
    path("medical-record/", donor_medical_record_view),
    path("eligibility-check/", eligibility_check_view),
    path("availability-check/", availability_check_view),
]