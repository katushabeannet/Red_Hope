import math

from django.db.models import OuterRef, Q, Subquery
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import (
    DonorProfile,
    DonorMedicalRecord,
    EligibilityAssessment,
    AvailabilityAssessment,
    DonationRecord,
)

from .serializers import (
    DonorProfileSerializer,
    DonorMedicalRecordSerializer,
    EligibilityAssessmentSerializer,
    AvailabilityAssessmentSerializer,
)

from datetime import timedelta

from ai_modules.eligibility.eligibility_engine import check_donor_eligibility
from ai_modules.availability.availability_engine import predict_availability
from ai_modules.gpt_response_generator import format_verified_response
from neo4j_service.neo4j_client import Neo4jClient
from .badge_engine import award_badges


@api_view(["GET", "POST", "PUT"])
@permission_classes([IsAuthenticated])
def donor_profile_view(request):
    profile = DonorProfile.objects.filter(user=request.user).first()

    if request.method == "GET":
        if not profile:
            return Response(
                {"message": "No donor profile found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DonorProfileSerializer(profile)
        return Response(serializer.data)

    if request.method == "POST":
        if profile:
            return Response(
                {"error": "Donor profile already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = DonorProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "PUT":
        if not profile:
            return Response(
                {"error": "No donor profile found to update."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DonorProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST", "PUT"])
@permission_classes([IsAuthenticated])
def donor_medical_record_view(request):
    profile = DonorProfile.objects.filter(user=request.user).first()

    if not profile:
        return Response(
            {"error": "Create donor profile first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    record = DonorMedicalRecord.objects.filter(donor=profile).first()

    if request.method == "GET":
        if not record:
            return Response(
                {"message": "No medical record found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DonorMedicalRecordSerializer(record)
        return Response(serializer.data)

    if request.method == "POST":
        if record:
            return Response(
                {"error": "Medical record already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = DonorMedicalRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(donor=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "PUT":
        if not record:
            return Response(
                {"error": "No medical record found to update."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DonorMedicalRecordSerializer(record, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def eligibility_check_view(request):
    profile = DonorProfile.objects.filter(user=request.user).first()

    if not profile:
        return Response(
            {"error": "Create donor profile before checking eligibility."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    medical_record = DonorMedicalRecord.objects.filter(donor=profile).first()

    if not medical_record:
        return Response(
            {"error": "Create donor medical record before checking eligibility."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = check_donor_eligibility(profile, medical_record)

    assessment = EligibilityAssessment.objects.create(
        donor=profile,
        is_eligible=result["is_eligible"],
        age=result["age"],
        reasons=result["reasons"],
        summary=result["summary"],
    )

    try:
        neo4j_client = Neo4jClient()
        neo4j_client.create_eligibility_trace(
            donor_email=request.user.email,
            full_name=request.user.full_name,
            is_eligible=result["is_eligible"],
            summary=result["summary"],
            reasons=result["reasons"],
        )
        neo4j_client.close()
    except Exception as e:
        print("Neo4j eligibility trace failed:", e)

    assistant_response = format_verified_response("eligibility", result)

    return Response(
        {
            "message": "Eligibility assessment completed.",
            "assessment": EligibilityAssessmentSerializer(assessment).data,
            "assistant_response": assistant_response,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def availability_check_view(request):
    profile = DonorProfile.objects.filter(user=request.user).first()

    if not profile:
        return Response(
            {"error": "Create donor profile before checking availability."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    medical_record = DonorMedicalRecord.objects.filter(donor=profile).first()

    if not medical_record:
        return Response(
            {"error": "Create donor medical record before checking availability."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = predict_availability(profile, medical_record)

    assessment = AvailabilityAssessment.objects.create(
        donor=profile,
        is_available=result["is_available"],
        availability_probability=result["availability_probability"],
        reasons=result["reasons"],
        summary=result["summary"],
    )

    try:
        neo4j_client = Neo4jClient()
        neo4j_client.create_availability_trace(
            donor_email=request.user.email,
            full_name=request.user.full_name,
            is_available=result["is_available"],
            probability=result["availability_probability"],
            summary=result["summary"],
            reasons=result["reasons"],
        )
        neo4j_client.close()
    except Exception as e:
        print("Neo4j availability trace failed:", e)

    assistant_response = format_verified_response("availability", result)

    return Response(
        {
            "message": "Availability assessment completed.",
            "assessment": AvailabilityAssessmentSerializer(assessment).data,
            "assistant_response": assistant_response,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def campaign_ready_donors_view(request):
    ready_donors = []

    donor_profiles = DonorProfile.objects.select_related(
        "user",
        "medical_record",
    ).all()

    for profile in donor_profiles:
        try:
            medical_record = profile.medical_record
        except DonorMedicalRecord.DoesNotExist:
            continue

        eligibility_result = check_donor_eligibility(profile, medical_record)
        availability_result = predict_availability(profile, medical_record)

        if eligibility_result["is_eligible"] and availability_result["is_available"]:
            ready_donors.append(
                {
                    "donor_id": profile.id,
                    "full_name": profile.user.full_name,
                    "email": profile.user.email,
                    "phone_number": profile.phone_number,
                    "blood_group": profile.blood_group,
                    "district": profile.address,
                    "eligibility_summary": eligibility_result["summary"],
                    "availability_probability": availability_result[
                        "availability_probability"
                    ],
                    "availability_summary": availability_result["summary"],
                }
            )

    return Response(
        {
            "total_ready_donors": len(ready_donors),
            "ready_donors": ready_donors,
        }
    )
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def donor_assessment_history_view(request):
    profile = DonorProfile.objects.filter(user=request.user).first()
    if not profile:
        return Response(
            {"error": "No donor profile found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    page = max(1, int(request.query_params.get("page", 1)))
    page_size = min(20, max(1, int(request.query_params.get("page_size", 5))))
    start = (page - 1) * page_size

    eligibility_qs = EligibilityAssessment.objects.filter(
        donor=profile
    ).order_by("-assessed_at")
    availability_qs = AvailabilityAssessment.objects.filter(
        donor=profile
    ).order_by("-assessed_at")

    e_total = eligibility_qs.count()
    a_total = availability_qs.count()

    return Response(
        {
            "eligibility_history": EligibilityAssessmentSerializer(
                eligibility_qs[start : start + page_size], many=True
            ).data,
            "availability_history": AvailabilityAssessmentSerializer(
                availability_qs[start : start + page_size], many=True
            ).data,
            "eligibility_total": e_total,
            "availability_total": a_total,
            "eligibility_total_pages": math.ceil(e_total / page_size) if e_total else 1,
            "availability_total_pages": math.ceil(a_total / page_size) if a_total else 1,
            "page": page,
            "page_size": page_size,
        }
    )


def _churn_risk(donation_date, today):
    if not donation_date:
        return "HIGH"
    days = (today - donation_date).days
    if days > 365:
        return "HIGH"
    if days > 180:
        return "MEDIUM"
    return "LOW"


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_donors_list_view(request):
    from datetime import date

    search = request.query_params.get("search", "").strip()
    page = max(1, int(request.query_params.get("page", 1)))
    page_size = min(100, max(1, int(request.query_params.get("page_size", 20))))

    donors_qs = DonorProfile.objects.select_related("user", "medical_record").all()

    if search:
        donors_qs = donors_qs.filter(
            Q(user__full_name__icontains=search)
            | Q(user__email__icontains=search)
            | Q(phone_number__icontains=search)
            | Q(address__icontains=search)
        )

    total_count = donors_qs.count()
    start = (page - 1) * page_size
    page_qs = list(donors_qs[start : start + page_size])

    # Annotate latest donation date per donor for churn risk (gracefully degrades)
    today = date.today()
    latest_donations = {}
    try:
        ids = [d.id for d in page_qs]
        latest_sub = (
            DonationRecord.objects.filter(donor_id=OuterRef("pk"))
            .order_by("-donation_date")
            .values("donation_date")[:1]
        )
        for row in DonorProfile.objects.filter(id__in=ids).annotate(ld=Subquery(latest_sub)):
            latest_donations[row.id] = row.ld
    except Exception:
        pass

    serializer = DonorProfileSerializer(page_qs, many=True)
    results = list(serializer.data)
    for item in results:
        ld = latest_donations.get(item["id"])
        item["latest_donation_date"] = str(ld) if ld else None
        item["churn_risk"] = _churn_risk(ld, today)

    return Response(
        {
            "total": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": math.ceil(total_count / page_size) if total_count else 1,
            "results": results,
        }
    )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_medical_record_manage_view(request):
    donor_id = request.data.get("donor_id")

    if not donor_id:
        return Response(
            {"error": "donor_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        donor = DonorProfile.objects.get(id=donor_id)
    except DonorProfile.DoesNotExist:
        return Response(
            {"error": "Donor profile not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    blood_group = request.data.get("blood_group")
    if blood_group:
        donor.blood_group = blood_group
        donor.save(update_fields=["blood_group"])

    medical_record, created = DonorMedicalRecord.objects.update_or_create(
        donor=donor,
        defaults={
            "weight_kg": request.data.get("weight_kg"),
            "hemoglobin_level": request.data.get("hemoglobin_level"),
            "has_recent_illness": request.data.get("has_recent_illness", False),
            "has_chronic_condition": request.data.get(
                "has_chronic_condition",
                False,
            ),
            "last_donation_date": request.data.get("last_donation_date") or None,
            "is_pregnant": request.data.get("is_pregnant", False),
            "is_on_medication": request.data.get("is_on_medication", False),
        },
    )

    return Response(
        {
            "message": (
                "Medical record created successfully."
                if created
                else "Medical record updated successfully."
            ),
            "created": created,
            "medical_record": {
                "id": medical_record.id,
                "donor_id": donor.id,
                "weight_kg": medical_record.weight_kg,
                "hemoglobin_level": medical_record.hemoglobin_level,
                "has_recent_illness": medical_record.has_recent_illness,
                "has_chronic_condition": medical_record.has_chronic_condition,
                "last_donation_date": medical_record.last_donation_date,
                "is_pregnant": medical_record.is_pregnant,
                "is_on_medication": medical_record.is_on_medication,
                "updated_at": medical_record.updated_at,
            },
        },
        status=status.HTTP_200_OK,
    )
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    try:
        profile = request.user.donor_profile
    except Exception:
        return Response(
            {"error": "No donor profile found to update."},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = DonorProfileSerializer(profile, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_record_donation_view(request):
    donor_id = request.data.get("donor_id")
    donation_date = request.data.get("donation_date")

    if not donor_id or not donation_date:
        return Response(
            {"error": "donor_id and donation_date are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        profile = DonorProfile.objects.get(id=donor_id)
    except DonorProfile.DoesNotExist:
        return Response(
            {"error": "Donor profile not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    record = DonationRecord.objects.create(
        donor=profile,
        donation_date=donation_date,
        camp_name=request.data.get("camp_name", ""),
        notes=request.data.get("notes", ""),
    )

    profile.total_donations += 1
    profile.save(update_fields=["total_donations"])

    award_badges(profile)

    # Send donation confirmation + next eligible date to donor
    next_eligible = record.donation_date + timedelta(days=90)
    try:
        from notifications.services import create_notification
        create_notification(
            recipient=profile.user,
            title="Donation Recorded — Thank You!",
            message=(
                f"Your blood donation on {record.donation_date.strftime('%d %b %Y')} has been recorded. "
                f"Your next eligible donation date is {next_eligible.strftime('%d %b %Y')}. "
                "We will remind you as that date approaches."
            ),
            notification_type="SYSTEM",
            action_label="View Dashboard",
            action_url="/donor-dashboard",
        )
    except Exception:
        pass

    return Response(
        {
            "message": "Donation recorded successfully.",
            "donor_name": profile.user.full_name,
            "total_donations": profile.total_donations,
            "donation_date": str(record.donation_date),
            "next_eligible_date": str(next_eligible),
            "camp_name": record.camp_name,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def donor_donation_history_view(request):
    try:
        profile = DonorProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "No donor profile found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        page = max(1, int(request.query_params.get("page", 1)))
        page_size = min(20, max(1, int(request.query_params.get("page_size", 5))))
        start = (page - 1) * page_size

        records = DonationRecord.objects.filter(donor=profile).order_by("-donation_date")
        total = records.count()

        return Response(
            {
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": math.ceil(total / page_size) if total else 1,
                "donations": [
                    {
                        "id": r.id,
                        "donation_date": str(r.donation_date),
                        "camp_name": r.camp_name,
                        "notes": r.notes,
                        "recorded_at": str(r.recorded_at),
                    }
                    for r in records[start : start + page_size]
                ],
            }
        )
    except Exception:
        return Response(
            {"donations": [], "total": 0, "page": 1, "page_size": 5, "total_pages": 1}
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def donor_certificate_view(request, donation_id):
    try:
        from reportlab.pdfgen import canvas as rl_canvas
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.colors import HexColor
        from django.http import HttpResponse
        import io
    except ImportError:
        return Response(
            {"error": "PDF generation requires reportlab. Install with: pip install reportlab"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    try:
        profile = DonorProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "No donor profile found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        record = DonationRecord.objects.filter(id=donation_id, donor=profile).first()
        if not record:
            return Response(
                {"error": "Donation record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
    except Exception:
        return Response(
            {"error": "Donation records not available. Run pending migrations first."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    buffer = io.BytesIO()
    p = rl_canvas.Canvas(buffer, pagesize=A4)
    w, h = A4

    crimson = HexColor("#C0162C")
    dark = HexColor("#1e293b")
    muted = HexColor("#64748b")
    white = HexColor("#ffffff")
    light_gray = HexColor("#e2e8f0")

    # Outer border
    p.setStrokeColor(crimson)
    p.setLineWidth(3)
    p.rect(30, 30, w - 60, h - 60, stroke=1, fill=0)
    p.setLineWidth(1)
    p.rect(40, 40, w - 80, h - 80, stroke=1, fill=0)

    # Header band
    p.setFillColor(crimson)
    p.rect(30, h - 130, w - 60, 100, stroke=0, fill=1)
    p.setFillColor(white)
    p.setFont("Helvetica-Bold", 26)
    p.drawCentredString(w / 2, h - 80, "BLOOD DONATION CERTIFICATE")
    p.setFont("Helvetica", 13)
    p.drawCentredString(w / 2, h - 105, "Uganda Blood Transfusion Service — UBTS Platform")

    # Body
    p.setFillColor(dark)
    p.setFont("Helvetica", 14)
    p.drawCentredString(w / 2, h - 165, "This is to certify that")

    # Donor name
    p.setFont("Helvetica-Bold", 28)
    p.setFillColor(crimson)
    p.drawCentredString(w / 2, h - 205, profile.user.full_name)
    nw = p.stringWidth(profile.user.full_name, "Helvetica-Bold", 28)
    p.setStrokeColor(crimson)
    p.setLineWidth(1.5)
    p.line(w / 2 - nw / 2, h - 215, w / 2 + nw / 2, h - 215)

    p.setFillColor(dark)
    p.setFont("Helvetica", 14)
    p.drawCentredString(w / 2, h - 250, "has successfully donated blood on")

    p.setFont("Helvetica-Bold", 17)
    p.setFillColor(crimson)
    p.drawCentredString(w / 2, h - 280, record.donation_date.strftime("%d %B %Y"))

    if record.camp_name:
        p.setFillColor(dark)
        p.setFont("Helvetica", 14)
        p.drawCentredString(w / 2, h - 315, "at")
        p.setFont("Helvetica-Bold", 15)
        p.drawCentredString(w / 2, h - 340, record.camp_name)

    # Stats row
    p.setFillColor(muted)
    p.setFont("Helvetica", 13)
    stats_y = h - 385
    p.drawCentredString(
        w / 2,
        stats_y,
        f"Lifetime Donations: {profile.total_donations}   |   Blood Group: {profile.blood_group or 'N/A'}",
    )

    # Quote
    p.setFont("Helvetica-Oblique", 12)
    p.setFillColor(HexColor("#94a3b8"))
    p.drawCentredString(
        w / 2,
        h - 425,
        '"Every drop counts. Your gift is someone\'s second chance at life."',
    )

    # Divider
    p.setStrokeColor(light_gray)
    p.setLineWidth(1)
    p.line(80, h - 445, w - 80, h - 445)

    # Footer
    p.setFillColor(muted)
    p.setFont("Helvetica", 11)
    p.drawCentredString(w / 2, h - 465, "Uganda Blood Transfusion Service (UBTS)")
    p.drawCentredString(w / 2, h - 485, "Intelligent Blood Donation Assistance Platform")
    p.setFont("Helvetica", 10)
    p.setFillColor(HexColor("#94a3b8"))
    p.drawCentredString(w / 2, h - 510, f"Certificate Ref: UBTS-CERT-{donation_id:06d}")

    p.save()
    buffer.seek(0)

    from django.http import HttpResponse
    response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="UBTS_Certificate_{donation_id}.pdf"'
    )
    return response


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_donors_export_view(request):
    import csv
    from django.http import HttpResponse

    search = request.query_params.get("search", "").strip()
    donors = DonorProfile.objects.select_related("user", "medical_record").all()

    if search:
        donors = donors.filter(
            Q(user__full_name__icontains=search)
            | Q(user__email__icontains=search)
            | Q(phone_number__icontains=search)
            | Q(address__icontains=search)
        )

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="ubts_donors.csv"'

    writer = csv.writer(response)
    writer.writerow([
        "Full Name", "Email", "Phone", "Gender", "Blood Group",
        "Address", "Total Donations", "Medical Record", "Date of Birth",
    ])

    for donor in donors:
        has_medical = False
        try:
            has_medical = donor.medical_record is not None
        except Exception:
            pass

        writer.writerow([
            donor.user.full_name,
            donor.user.email,
            donor.phone_number or "",
            donor.gender or "",
            donor.blood_group or "",
            donor.address or "",
            donor.total_donations,
            "Yes" if has_medical else "No",
            donor.date_of_birth or "",
        ])

    return response


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_lapsed_donors_view(request):
    from datetime import date, timedelta

    cutoff = date.today() - timedelta(days=180)
    search = request.query_params.get("search", "").strip()
    page = max(1, int(request.query_params.get("page", 1)))
    page_size = min(50, max(1, int(request.query_params.get("page_size", 20))))

    try:
        latest_donation_sub = (
            DonationRecord.objects.filter(donor_id=OuterRef("pk"))
            .order_by("-donation_date")
            .values("donation_date")[:1]
        )

        qs = DonorProfile.objects.select_related("user").annotate(
            latest_donation=Subquery(latest_donation_sub)
        ).filter(Q(latest_donation__lt=cutoff) | Q(latest_donation__isnull=True))
    except Exception:
        qs = DonorProfile.objects.none()

    if search:
        qs = qs.filter(
            Q(user__full_name__icontains=search) | Q(user__email__icontains=search)
        )

    today = date.today()
    total = qs.count()
    offset = (page - 1) * page_size
    results = []

    for donor in qs[offset : offset + page_size]:
        latest = donor.latest_donation
        results.append({
            "id": donor.id,
            "full_name": donor.user.full_name,
            "email": donor.user.email,
            "phone_number": donor.phone_number,
            "blood_group": donor.blood_group,
            "latest_donation_date": str(latest) if latest else None,
            "days_lapsed": (today - latest).days if latest else None,
        })

    return Response({
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total else 1,
        "results": results,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def donor_camp_checkin_view(request, camp_id):
    if not hasattr(request.user, "donor_profile"):
        return Response(
            {"error": "Only registered donors can check in."},
            status=status.HTTP_403_FORBIDDEN,
        )

    from camps.models import DonationCamp
    from datetime import date

    try:
        camp = DonationCamp.objects.get(id=camp_id)
    except DonationCamp.DoesNotExist:
        return Response({"error": "Camp not found."}, status=status.HTTP_404_NOT_FOUND)

    donor = request.user.donor_profile
    today = date.today()

    try:
        already = DonationRecord.objects.filter(
            donor=donor, donation_date=today, camp_name=camp.name
        ).exists()
        if already:
            return Response(
                {"error": "You have already checked in to this camp today."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        DonationRecord.objects.create(
            donor=donor,
            donation_date=today,
            camp_name=camp.name,
            notes="Self check-in via QR code",
        )

        donor.total_donations += 1
        donor.save(update_fields=["total_donations"])

        try:
            award_badges(donor)
        except Exception:
            pass

        try:
            from notifications.services import create_notification
            next_eligible = today + timedelta(days=90)
            create_notification(
                recipient=request.user,
                title="Check-in Recorded — Thank You!",
                message=(
                    f"Your attendance at {camp.name} on {today.strftime('%d %b %Y')} has been recorded. "
                    f"Your next eligible donation date is {next_eligible.strftime('%d %b %Y')}."
                ),
                notification_type="SYSTEM",
                action_label="View Dashboard",
                action_url="/donor-dashboard",
            )
        except Exception:
            pass

    except Exception as exc:
        return Response(
            {"error": "Could not record check-in.", "detail": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response({
        "message": f"Check-in recorded at {camp.name}!",
        "donation_date": str(today),
        "camp_name": camp.name,
        "total_donations": donor.total_donations,
    })


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_walkin_donor_register_view(request):
    """
    Register a walk-in donor: creates user account, donor profile, and optional medical record.
    Only accessible by admin users (UBTS staff).
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()

    data = request.data

    email     = (data.get("email") or "").strip().lower()
    full_name = (data.get("full_name") or "").strip()
    password  = (data.get("password") or "").strip()

    if not email:
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
    if not full_name:
        return Response({"error": "Full name is required."}, status=status.HTTP_400_BAD_REQUEST)
    if not password or len(password) < 6:
        return Response({"error": "Password must be at least 6 characters."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response(
            {"error": f"A donor account with email '{email}' already exists."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    base_username = email.split("@")[0]
    username = base_username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1

    user = User(email=email, username=username, full_name=full_name, role="DONOR")
    user.set_password(password)
    user.save()

    profile = DonorProfile.objects.create(
        user=user,
        phone_number=(data.get("phone_number") or "").strip(),
        blood_group=data.get("blood_group") or "",
        date_of_birth=data.get("date_of_birth") or None,
        gender=(data.get("gender") or "").strip(),
        address=(data.get("address") or "").strip(),
        whatsapp_number=(data.get("whatsapp_number") or "").strip(),
        whatsapp_consent=bool(data.get("whatsapp_consent", False)),
    )

    medical_fields = ["weight_kg", "hemoglobin_level", "last_donation_date",
                      "has_recent_illness", "has_chronic_condition",
                      "is_pregnant", "is_on_medication"]
    has_medical = any(data.get(f) for f in medical_fields)

    if has_medical:
        DonorMedicalRecord.objects.create(
            donor=profile,
            weight_kg=float(data["weight_kg"]) if data.get("weight_kg") else None,
            hemoglobin_level=float(data["hemoglobin_level"]) if data.get("hemoglobin_level") else None,
            has_recent_illness=bool(data.get("has_recent_illness", False)),
            has_chronic_condition=bool(data.get("has_chronic_condition", False)),
            last_donation_date=data.get("last_donation_date") or None,
            is_pregnant=bool(data.get("is_pregnant", False)),
            is_on_medication=bool(data.get("is_on_medication", False)),
        )

    return Response(
        {
            "message": "Walk-in donor registered successfully.",
            "donor_id": profile.id,
            "user": {"id": user.id, "email": user.email, "full_name": user.full_name},
        },
        status=status.HTTP_201_CREATED,
    )