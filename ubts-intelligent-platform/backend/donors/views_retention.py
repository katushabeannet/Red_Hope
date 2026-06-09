from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from donors.models import DonorProfile
from donors.retention_engine import (
    get_donor_retention_summary,
    get_admin_retention_list,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def donor_retention_summary_view(request):
    profile = request.user.donor_profile
    summary = get_donor_retention_summary(profile)
    return Response(summary)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_retention_reminders_view(request):
    donor_profiles = DonorProfile.objects.select_related("user").all()
    reminders = get_admin_retention_list(donor_profiles)

    return Response(
        {
            "total_reminders": len(reminders),
            "reminders": reminders,
        }
    )