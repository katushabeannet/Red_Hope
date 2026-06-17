import math

from django.db.models import Q
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


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_donors_list_view(request):
    search = request.query_params.get("search", "").strip()
    page = max(1, int(request.query_params.get("page", 1)))
    page_size = min(100, max(1, int(request.query_params.get("page_size", 20))))

    donors = DonorProfile.objects.select_related("user", "medical_record").all()

    if search:
        donors = donors.filter(
            Q(user__full_name__icontains=search)
            | Q(user__email__icontains=search)
            | Q(phone_number__icontains=search)
            | Q(address__icontains=search)
        )

    total_count = donors.count()
    start = (page - 1) * page_size
    serializer = DonorProfileSerializer(donors[start : start + page_size], many=True)

    return Response(
        {
            "total": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": math.ceil(total_count / page_size) if total_count else 1,
            "results": serializer.data,
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

    return Response(
        {
            "message": "Donation recorded successfully.",
            "donor_name": profile.user.full_name,
            "total_donations": profile.total_donations,
            "donation_date": str(record.donation_date),
            "camp_name": record.camp_name,
        },
        status=status.HTTP_201_CREATED,
    )