from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.response import Response

from donors.impact_engine import get_donor_impact_summary


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def donor_impact_view(request):
    profile = request.user.donor_profile

    summary = get_donor_impact_summary(profile)

    return Response(summary)