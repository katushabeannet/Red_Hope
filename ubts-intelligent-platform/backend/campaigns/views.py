from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from donors.models import (
    DonorProfile,
    DonorMedicalRecord,
    EligibilityAssessment,
    AvailabilityAssessment,
)

from camps.models import DonationCamp


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