from django.urls import path
from .views import (
    admin_dashboard_summary_view,
    recent_assessments_view,
    camp_statistics_view,
)

urlpatterns = [
    path("dashboard-summary/", admin_dashboard_summary_view),
    path("recent-assessments/", recent_assessments_view),
    path("camp-statistics/", camp_statistics_view),
]