from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from campaigns.models import CampaignPerformance
from donors.campaign_targeting_engine import scan_personalized_campaign_donors


def calculate_average(items, key):
    values = [
        item.get(key)
        for item in items
        if item.get(key) is not None
    ]

    if not values:
        return 0

    return round(sum(values) / len(values), 4)


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

    matched_donors = result.get("matched_donors", [])
    available_donors = [
        donor for donor in matched_donors if donor.get("is_available")
    ]
    unavailable_donors = [
        donor for donor in matched_donors if not donor.get("is_available")
    ]

    performance = CampaignPerformance.objects.create(
        blood_group=blood_group or "",
        radius_km=radius_km or 10,
        campaign_latitude=campaign_latitude or None,
        campaign_longitude=campaign_longitude or None,
        total_matches=len(matched_donors),
        available_donors=len(available_donors),
        unavailable_donors=len(unavailable_donors),
        high_priority_donors=len(result.get("high_priority_donors", [])),
        medium_priority_donors=len(result.get("medium_priority_donors", [])),
        low_priority_donors=len(result.get("low_priority_donors", [])),
        ineligible_donors=len(result.get("ineligible_donors", [])),
        outside_radius_donors=len(result.get("outside_radius_donors", [])),
        skipped_donors=len(result.get("skipped_donors", [])),
        average_availability_score=calculate_average(
            matched_donors,
            "availability_probability",
        ),
        average_campaign_priority_score=calculate_average(
            matched_donors,
            "campaign_priority_score",
        ),
        created_by=request.user,
    )

    result["campaign_performance_id"] = performance.id
    result["performance_summary"] = {
        "available_donors": performance.available_donors,
        "unavailable_donors": performance.unavailable_donors,
        "average_availability_score": performance.average_availability_score,
        "average_campaign_priority_score": performance.average_campaign_priority_score,
    }

    return Response(result)