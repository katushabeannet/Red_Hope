from django.urls import path
from .views import (
    public_platform_stats_view,
    admin_dashboard_summary_view,
    recent_assessments_view,
    camp_statistics_view,
    campaign_performance_analytics_view,
    admin_analytics_view,
)

urlpatterns = [
    path("public-stats/", public_platform_stats_view),
    path("dashboard-summary/", admin_dashboard_summary_view),
    path("recent-assessments/", recent_assessments_view),
    path("camp-statistics/", camp_statistics_view),
    path("campaign-performance/", campaign_performance_analytics_view),
    path("analytics/", admin_analytics_view),
]