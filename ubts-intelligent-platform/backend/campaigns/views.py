from django.db.models import Avg, Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from donors.models import (
    DonorProfile,
    DonorMedicalRecord,
    EligibilityAssessment,
    AvailabilityAssessment,
)

from camps.models import DonationCamp
from .models import CampaignPerformance


@api_view(["GET"])
@permission_classes([AllowAny])
def public_platform_stats_view(request):
    total_donors = DonorProfile.objects.count()
    active_camps = DonationCamp.objects.filter(
        status=DonationCamp.CampStatus.ACTIVE
    ).count()
    total_camps = DonationCamp.objects.count()

    return Response(
        {
            "total_donors": total_donors,
            "active_camps": active_camps,
            "total_camps": total_camps,
        }
    )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_dashboard_summary_view(request):
    total_donors = DonorProfile.objects.count()
    total_medical_records = DonorMedicalRecord.objects.count()
    total_camps = DonationCamp.objects.count()
    active_camps = DonationCamp.objects.filter(
        status=DonationCamp.CampStatus.ACTIVE
    ).count()

    latest_eligible_count = EligibilityAssessment.objects.filter(
        is_eligible=True
    ).count()

    latest_available_count = AvailabilityAssessment.objects.filter(
        is_available=True
    ).count()

    return Response(
        {
            "total_donors": total_donors,
            "total_medical_records": total_medical_records,
            "total_camps": total_camps,
            "active_camps": active_camps,
            "eligible_assessments": latest_eligible_count,
            "available_assessments": latest_available_count,
        }
    )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def recent_assessments_view(request):
    recent_eligibility = EligibilityAssessment.objects.select_related(
        "donor",
        "donor__user",
    ).order_by("-assessed_at")[:5]

    recent_availability = AvailabilityAssessment.objects.select_related(
        "donor",
        "donor__user",
    ).order_by("-assessed_at")[:5]

    return Response(
        {
            "recent_eligibility": [
                {
                    "donor": item.donor.user.full_name,
                    "email": item.donor.user.email,
                    "is_eligible": item.is_eligible,
                    "summary": item.summary,
                    "assessed_at": item.assessed_at,
                }
                for item in recent_eligibility
            ],
            "recent_availability": [
                {
                    "donor": item.donor.user.full_name,
                    "email": item.donor.user.email,
                    "is_available": item.is_available,
                    "availability_probability": item.availability_probability,
                    "summary": item.summary,
                    "assessed_at": item.assessed_at,
                }
                for item in recent_availability
            ],
        }
    )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def camp_statistics_view(request):
    return Response(
        {
            "total_camps": DonationCamp.objects.count(),
            "active_camps": DonationCamp.objects.filter(
                status=DonationCamp.CampStatus.ACTIVE
            ).count(),
            "inactive_camps": DonationCamp.objects.filter(
                status=DonationCamp.CampStatus.INACTIVE
            ).count(),
            "completed_camps": DonationCamp.objects.filter(
                status=DonationCamp.CampStatus.COMPLETED
            ).count(),
        }
    )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def campaign_performance_analytics_view(request):
    records = CampaignPerformance.objects.all()

    totals = records.aggregate(
        total_targeted=Sum("total_matches"),
        total_available=Sum("available_donors"),
        total_unavailable=Sum("unavailable_donors"),
        total_high_priority=Sum("high_priority_donors"),
        total_medium_priority=Sum("medium_priority_donors"),
        total_low_priority=Sum("low_priority_donors"),
        avg_availability=Avg("average_availability_score"),
        avg_priority=Avg("average_campaign_priority_score"),
    )

    recent_campaigns = records[:10]

    blood_group_summary = {}
    for record in records:
        group = record.blood_group or "ALL"
        if group not in blood_group_summary:
            blood_group_summary[group] = {
                "blood_group": group,
                "campaigns": 0,
                "matched": 0,
                "available": 0,
                "unavailable": 0,
            }

        blood_group_summary[group]["campaigns"] += 1
        blood_group_summary[group]["matched"] += record.total_matches
        blood_group_summary[group]["available"] += record.available_donors
        blood_group_summary[group]["unavailable"] += record.unavailable_donors

    return Response(
        {
            "total_campaign_scans": records.count(),
            "total_targeted_donors": totals["total_targeted"] or 0,
            "total_available_donors": totals["total_available"] or 0,
            "total_unavailable_donors": totals["total_unavailable"] or 0,
            "total_high_priority_donors": totals["total_high_priority"] or 0,
            "total_medium_priority_donors": totals["total_medium_priority"] or 0,
            "total_low_priority_donors": totals["total_low_priority"] or 0,
            "average_availability_score": round(
                totals["avg_availability"] or 0,
                4,
            ),
            "average_campaign_priority_score": round(
                totals["avg_priority"] or 0,
                4,
            ),
            "blood_group_summary": list(blood_group_summary.values()),
            "recent_campaigns": [
                {
                    "id": record.id,
                    "blood_group": record.blood_group or "All",
                    "radius_km": record.radius_km,
                    "total_matches": record.total_matches,
                    "available_donors": record.available_donors,
                    "unavailable_donors": record.unavailable_donors,
                    "high_priority_donors": record.high_priority_donors,
                    "medium_priority_donors": record.medium_priority_donors,
                    "low_priority_donors": record.low_priority_donors,
                    "average_availability_score": record.average_availability_score,
                    "average_campaign_priority_score": record.average_campaign_priority_score,
                    "created_at": record.created_at,
                }
                for record in recent_campaigns
            ],
        }
    )