from django.urls import path

from .views import (
    my_notifications_view,
    generate_my_notifications_view,
    mark_notification_read_view,
    mark_all_notifications_read_view,
    admin_notifications_view,
    generate_camp_proximity_alerts_view,
    generate_blood_demand_alerts_view,
    blood_demand_alerts_list_view,
    campaign_blast_view,
)


urlpatterns = [
    path("my/", my_notifications_view),
    path("generate-my/", generate_my_notifications_view),
    path("<int:notification_id>/read/", mark_notification_read_view),
    path("read-all/", mark_all_notifications_read_view),
    path("admin/", admin_notifications_view),
    path("admin/camp-proximity-alerts/", generate_camp_proximity_alerts_view),
    path("admin/blood-demand-alerts/", generate_blood_demand_alerts_view),
    path("admin/blood-demand-alerts/list/", blood_demand_alerts_list_view),
    path("admin/campaign-blast/", campaign_blast_view),
]