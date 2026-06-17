from django.urls import path

from .views import (
    donor_profile_view,
    donor_medical_record_view,
    eligibility_check_view,
    availability_check_view,
    donor_assessment_history_view,
    donor_donation_history_view,
    donor_certificate_view,
    campaign_ready_donors_view,
    admin_donors_list_view,
    admin_medical_record_manage_view,
    update_profile_view,
    admin_record_donation_view,
    admin_donors_export_view,
)

from .views_impact import donor_impact_view

from .views_retention import (
    donor_retention_summary_view,
    admin_retention_reminders_view,
)

from .views_campaign import personalized_campaign_scan_view


urlpatterns = [
    path("profile/", donor_profile_view),
    path("profile/update/", update_profile_view),
    path("admin/record-donation/", admin_record_donation_view),
    path("medical-record/", donor_medical_record_view),
    path("eligibility-check/", eligibility_check_view),
    path("availability-check/", availability_check_view),
    path("assessment-history/", donor_assessment_history_view),
    path("donation-history/", donor_donation_history_view),
    path("certificate/<int:donation_id>/", donor_certificate_view),
    path("impact/", donor_impact_view),
    path("retention-summary/", donor_retention_summary_view),
    path("admin/campaign-ready/", campaign_ready_donors_view),
    path("admin/donors/", admin_donors_list_view),
    path("admin/medical-record/", admin_medical_record_manage_view),
    path("admin/donors/export/", admin_donors_export_view),
    path("admin/retention-reminders/", admin_retention_reminders_view),
    path("admin/personalized-campaign-scan/", personalized_campaign_scan_view),
]