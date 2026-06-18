from django.urls import path
from .views import (
    public_platform_stats_view,
    admin_dashboard_summary_view,
    recent_assessments_view,
    camp_statistics_view,
    campaign_performance_analytics_view,
    admin_analytics_view,
    blood_demand_forecast_view,
    campaign_scan_history_view,
    campaign_scan_detail_view,
    campaign_scan_mark_converted_view,
    campaign_scan_export_csv_view,
)

urlpatterns = [
    path("public-stats/", public_platform_stats_view),
    path("dashboard-summary/", admin_dashboard_summary_view),
    path("recent-assessments/", recent_assessments_view),
    path("camp-statistics/", camp_statistics_view),
    path("campaign-performance/", campaign_performance_analytics_view),
    path("analytics/", admin_analytics_view),
    path("blood-demand-forecast/", blood_demand_forecast_view),
    path("campaign-history/", campaign_scan_history_view),
    path("campaign-history/export/", campaign_scan_export_csv_view),
    path("campaign-history/<int:performance_id>/", campaign_scan_detail_view),
    path("campaign-history/<int:performance_id>/converted/", campaign_scan_mark_converted_view),
]