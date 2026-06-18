import csv
import io
import math
from datetime import date, timedelta

from django.db.models import Avg, Count, Q, Sum
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
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
from .models import CampaignPerformance, CampaignResponse


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


def _serialize_performance(record):
    return {
        "id": record.id,
        "campaign_name": record.campaign_name or "",
        "blood_group": record.blood_group or "All",
        "radius_km": record.radius_km,
        "total_matches": record.total_matches,
        "available_donors": record.available_donors,
        "unavailable_donors": record.unavailable_donors,
        "high_priority_donors": record.high_priority_donors,
        "medium_priority_donors": record.medium_priority_donors,
        "low_priority_donors": record.low_priority_donors,
        "ineligible_donors": record.ineligible_donors,
        "outside_radius_donors": record.outside_radius_donors,
        "skipped_donors": record.skipped_donors,
        "contacted_donors": record.contacted_donors,
        "converted_donors": record.converted_donors,
        "average_availability_score": record.average_availability_score,
        "average_campaign_priority_score": record.average_campaign_priority_score,
        "created_by": getattr(record.created_by, "full_name", None) or getattr(record.created_by, "email", None),
        "created_at": record.created_at,
    }


@api_view(["GET"])
@permission_classes([IsAdminUser])
def campaign_scan_history_view(request):
    search = request.query_params.get("search", "").strip()
    blood_group = request.query_params.get("blood_group", "").strip()
    page = max(1, int(request.query_params.get("page", 1)))
    page_size = min(50, max(1, int(request.query_params.get("page_size", 20))))

    records = CampaignPerformance.objects.select_related("created_by")

    if blood_group:
        records = records.filter(blood_group=blood_group)

    if search:
        records = records.filter(
            Q(campaign_name__icontains=search)
            | Q(blood_group__icontains=search)
            | Q(created_by__full_name__icontains=search)
            | Q(created_by__email__icontains=search)
        )

    total = records.count()
    start = (page - 1) * page_size
    page_records = records[start: start + page_size]

    return Response({
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total else 1,
        "results": [_serialize_performance(r) for r in page_records],
    })


@api_view(["GET"])
@permission_classes([IsAdminUser])
def campaign_scan_detail_view(request, performance_id):
    try:
        record = CampaignPerformance.objects.select_related("created_by").get(id=performance_id)
    except CampaignPerformance.DoesNotExist:
        return Response({"error": "Campaign scan not found."}, status=404)

    return Response(_serialize_performance(record))


@api_view(["POST"])
@permission_classes([IsAdminUser])
def campaign_scan_mark_converted_view(request, performance_id):
    try:
        record = CampaignPerformance.objects.get(id=performance_id)
    except CampaignPerformance.DoesNotExist:
        return Response({"error": "Campaign scan not found."}, status=404)

    count = int(request.data.get("converted_donors", 0))
    record.converted_donors = count
    record.save(update_fields=["converted_donors"])
    return Response({"message": "Conversion count updated.", "converted_donors": count})


@api_view(["GET"])
@permission_classes([IsAdminUser])
def campaign_scan_export_csv_view(request):
    blood_group = request.query_params.get("blood_group", "").strip()
    records = CampaignPerformance.objects.select_related("created_by").order_by("-created_at")

    if blood_group:
        records = records.filter(blood_group=blood_group)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Campaign Name", "Blood Group", "Radius (km)", "Total Matches",
        "Available", "Unavailable", "High Priority", "Medium Priority", "Low Priority",
        "Ineligible", "Outside Radius", "Skipped",
        "Contacted", "Converted",
        "Avg Availability", "Avg Priority Score",
        "Created By", "Created At",
    ])

    for r in records:
        writer.writerow([
            r.id,
            r.campaign_name or "",
            r.blood_group or "All",
            r.radius_km,
            r.total_matches,
            r.available_donors,
            r.unavailable_donors,
            r.high_priority_donors,
            r.medium_priority_donors,
            r.low_priority_donors,
            r.ineligible_donors,
            r.outside_radius_donors,
            r.skipped_donors,
            r.contacted_donors,
            r.converted_donors,
            round(r.average_availability_score, 4),
            round(r.average_campaign_priority_score, 4),
            getattr(r.created_by, "email", "") or "",
            r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else "",
        ])

    response = HttpResponse(output.getvalue(), content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="campaign_history.csv"'
    return response


# ── Campaign Response Tracking ───────────────────────────────────────────────

def _serialize_response(r):
    return {
        "id": r.id,
        "donor_id": r.donor_id,
        "donor_name": getattr(r.donor.user, "full_name", "") or getattr(r.donor.user, "email", ""),
        "donor_email": getattr(r.donor.user, "email", ""),
        "donor_phone": r.donor.phone_number or "",
        "donor_blood_group": r.donor.blood_group or "",
        "status": r.status,
        "response_date": r.response_date,
        "outcome": r.outcome,
        "notes": r.notes,
        "recorded_by": getattr(r.recorded_by, "email", None),
        "created_at": r.created_at,
        "updated_at": r.updated_at,
    }


@api_view(["GET"])
@permission_classes([IsAdminUser])
def campaign_responses_view(request, performance_id):
    try:
        campaign = CampaignPerformance.objects.get(id=performance_id)
    except CampaignPerformance.DoesNotExist:
        return Response({"error": "Campaign not found."}, status=404)

    status_filter = request.query_params.get("status", "").strip().upper()
    responses = CampaignResponse.objects.filter(campaign=campaign).select_related(
        "donor", "donor__user", "recorded_by"
    )

    if status_filter in ("CONTACTED", "RESPONDED", "DONATED", "NOT_INTERESTED"):
        responses = responses.filter(status=status_filter)

    status_counts = {
        "CONTACTED": responses.filter(status="CONTACTED").count(),
        "RESPONDED": responses.filter(status="RESPONDED").count(),
        "DONATED": responses.filter(status="DONATED").count(),
        "NOT_INTERESTED": responses.filter(status="NOT_INTERESTED").count(),
    }

    return Response({
        "campaign_id": performance_id,
        "total_responses": responses.count(),
        "status_counts": status_counts,
        "responses": [_serialize_response(r) for r in responses],
    })


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def campaign_response_update_view(request, response_id):
    try:
        cr = CampaignResponse.objects.select_related("donor", "donor__user").get(id=response_id)
    except CampaignResponse.DoesNotExist:
        return Response({"error": "Response record not found."}, status=404)

    allowed_statuses = {"CONTACTED", "RESPONDED", "DONATED", "NOT_INTERESTED"}
    new_status = request.data.get("status", "").upper()
    if new_status and new_status not in allowed_statuses:
        return Response({"error": f"Invalid status. Choose from: {', '.join(allowed_statuses)}"}, status=400)

    if new_status:
        cr.status = new_status
    if "response_date" in request.data:
        cr.response_date = request.data["response_date"] or None
    if "outcome" in request.data:
        cr.outcome = request.data["outcome"] or ""
    if "notes" in request.data:
        cr.notes = request.data["notes"] or ""

    cr.recorded_by = request.user
    cr.save()

    if new_status == "DONATED":
        try:
            perf = cr.campaign
            perf.converted_donors = CampaignResponse.objects.filter(
                campaign=perf, status="DONATED"
            ).count()
            perf.save(update_fields=["converted_donors"])
        except Exception:
            pass

    return Response(_serialize_response(cr))


@api_view(["POST"])
@permission_classes([IsAdminUser])
def campaign_response_bulk_update_view(request, performance_id):
    try:
        CampaignPerformance.objects.get(id=performance_id)
    except CampaignPerformance.DoesNotExist:
        return Response({"error": "Campaign not found."}, status=404)

    response_ids = request.data.get("response_ids", [])
    new_status = (request.data.get("status") or "").upper()
    allowed = {"CONTACTED", "RESPONDED", "DONATED", "NOT_INTERESTED"}

    if new_status not in allowed:
        return Response({"error": f"Invalid status. Choose from: {', '.join(allowed)}"}, status=400)
    if not response_ids:
        return Response({"error": "response_ids list is required."}, status=400)

    updated = CampaignResponse.objects.filter(
        id__in=response_ids,
        campaign_id=performance_id,
    ).update(status=new_status, recorded_by=request.user)

    if new_status == "DONATED":
        try:
            perf = CampaignPerformance.objects.get(id=performance_id)
            perf.converted_donors = CampaignResponse.objects.filter(
                campaign=perf, status="DONATED"
            ).count()
            perf.save(update_fields=["converted_donors"])
        except Exception:
            pass

    return Response({"message": f"{updated} response(s) updated to {new_status}.", "updated": updated})


@api_view(["GET"])
@permission_classes([IsAdminUser])
def campaign_responses_export_csv_view(request, performance_id):
    try:
        campaign = CampaignPerformance.objects.get(id=performance_id)
    except CampaignPerformance.DoesNotExist:
        return Response({"error": "Campaign not found."}, status=404)

    responses = CampaignResponse.objects.filter(campaign=campaign).select_related(
        "donor", "donor__user", "recorded_by"
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Response ID", "Donor Name", "Email", "Phone", "Blood Group",
        "Status", "Response Date", "Outcome", "Notes", "Recorded By", "Last Updated",
    ])
    for r in responses:
        writer.writerow([
            r.id,
            getattr(r.donor.user, "full_name", "") or "",
            getattr(r.donor.user, "email", "") or "",
            r.donor.phone_number or "",
            r.donor.blood_group or "",
            r.status,
            r.response_date or "",
            r.outcome or "",
            r.notes or "",
            getattr(r.recorded_by, "email", "") or "",
            r.updated_at.strftime("%Y-%m-%d %H:%M") if r.updated_at else "",
        ])

    http_response = HttpResponse(output.getvalue(), content_type="text/csv")
    http_response["Content-Disposition"] = f'attachment; filename="campaign_{performance_id}_responses.csv"'
    return http_response