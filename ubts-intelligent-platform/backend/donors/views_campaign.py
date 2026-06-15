from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from donors.campaign_targeting_engine import scan_personalized_campaign_donors


@api_view(["POST"])
@permission_classes([IsAdminUser])
def personalized_campaign_scan_view(request):
    blood_group = request.data.get("blood_group")
    campaign_latitude = request.data.get("campaign_latitude")
    campaign_longitude = request.data.get("campaign_longitude")
    radius_km = request.data.get("radius_km", 10)

    if campaign_latitude and not campaign_longitude:
        return Response(
            {"error": "Campaign longitude is required when latitude is provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if campaign_longitude and not campaign_latitude:
        return Response(
            {"error": "Campaign latitude is required when longitude is provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = scan_personalized_campaign_donors(
        blood_group=blood_group,
        campaign_latitude=campaign_latitude,
        campaign_longitude=campaign_longitude,
        radius_km=radius_km,
    )

    return Response(result)