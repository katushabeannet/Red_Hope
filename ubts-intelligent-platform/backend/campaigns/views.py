from datetime import date, timedelta

from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from donors.models import (
    DonorProfile,
    DonorMedicalRecord,
    DonationRecord,
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


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_analytics_view(request):
    six_months_ago = date.today() - timedelta(days=180)

    # DonationRecord queries — guarded in case migration hasn't been applied yet
    donations_by_month_data = []
    top_camps_data = []
    try:
        donations_by_month_qs = (
            DonationRecord.objects.filter(donation_date__gte=six_months_ago)
            .annotate(month=TruncMonth("donation_date"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        donations_by_month_data = [
            {"month": item["month"].strftime("%b %Y"), "donations": item["count"]}
            for item in donations_by_month_qs
        ]

        top_camps_qs = (
            DonationRecord.objects.exclude(camp_name="")
            .values("camp_name")
            .annotate(donations=Count("id"))
            .order_by("-donations")[:5]
        )
        top_camps_data = [
            {"camp": item["camp_name"], "donations": item["donations"]}
            for item in top_camps_qs
        ]
    except Exception:
        pass

    blood_group_dist = (
        DonorProfile.objects.exclude(blood_group="")
        .exclude(blood_group__isnull=True)
        .values("blood_group")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    eligible_count = EligibilityAssessment.objects.filter(is_eligible=True).count()
    ineligible_count = EligibilityAssessment.objects.filter(is_eligible=False).count()

    return Response(
        {
            "donations_by_month": donations_by_month_data,
            "blood_group_distribution": [
                {"blood_group": item["blood_group"], "count": item["count"]}
                for item in blood_group_dist
            ],
            "eligibility_breakdown": [
                {"name": "Eligible", "value": eligible_count},
                {"name": "Ineligible", "value": ineligible_count},
            ],
            "top_camps": top_camps_data,
        }
    )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def blood_demand_forecast_view(request):
    """
    Rule-based blood demand forecast.
    Compares recent donation activity per blood group against total eligible
    donor capacity to infer which groups may be in highest demand next week.
    """
    ALL_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    UNIVERSAL_DONORS = {"O-", "O+"}
    HIGH_NEED_ALWAYS = {"O-", "B-", "AB-"}

    today = date.today()
    recent_cutoff = today - timedelta(days=30)
    eligible_cutoff = today - timedelta(days=90)

    # Count donors per blood group
    donors_by_group = {
        item["blood_group"]: item["count"]
        for item in DonorProfile.objects.values("blood_group").annotate(count=Count("id"))
    }

    # Count recent donations per blood group (last 30 days)
    recent_donations = {}
    try:
        for item in (
            DonationRecord.objects.filter(donation_date__gte=recent_cutoff)
            .select_related("donor")
            .values("donor__blood_group")
            .annotate(count=Count("id"))
        ):
            recent_donations[item["donor__blood_group"]] = item["count"]
    except Exception:
        pass

    # Count eligible donors (haven't donated in 90 days) per blood group
    eligible_donors = {}
    try:
        donated_recently_ids = set(
            DonationRecord.objects.filter(donation_date__gte=eligible_cutoff)
            .values_list("donor_id", flat=True)
        )
        for item in (
            DonorProfile.objects.exclude(id__in=donated_recently_ids)
            .values("blood_group")
            .annotate(count=Count("id"))
        ):
            eligible_donors[item["blood_group"]] = item["count"]
    except Exception:
        pass

    forecast = []
    for bg in ALL_GROUPS:
        total = donors_by_group.get(bg, 0)
        recent = recent_donations.get(bg, 0)
        eligible = eligible_donors.get(bg, total)

        if total == 0:
            demand_level = "UNKNOWN"
            reason = "No donors registered with this blood group."
        elif bg in HIGH_NEED_ALWAYS:
            demand_level = "HIGH"
            reason = f"Rare type — always in high clinical demand. {eligible} eligible donor(s) available."
        else:
            coverage = eligible / total if total else 0
            if coverage < 0.3 or recent < 2:
                demand_level = "HIGH"
                reason = f"Low donor activity ({recent} donations in 30 days). Only {eligible} eligible donor(s)."
            elif coverage < 0.6 or recent < 5:
                demand_level = "MEDIUM"
                reason = f"Moderate activity ({recent} donations). {eligible} of {total} donors eligible."
            else:
                demand_level = "LOW"
                reason = f"Adequate supply. {recent} donations in 30 days, {eligible} eligible donors."

        forecast.append({
            "blood_group": bg,
            "demand_level": demand_level,
            "recent_donations": recent,
            "eligible_donors": eligible,
            "total_donors": total,
            "reason": reason,
        })

    # Sort: HIGH first, then MEDIUM, then LOW
    order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2, "UNKNOWN": 3}
    forecast.sort(key=lambda x: order.get(x["demand_level"], 3))

    return Response({
        "forecast_date": str(today),
        "forecast": forecast,
    })