from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import (
    DonorProfile,
    DonorMedicalRecord,
    EligibilityAssessment,
    AvailabilityAssessment,
)

from .serializers import (
    DonorProfileSerializer,
    DonorMedicalRecordSerializer,
    EligibilityAssessmentSerializer,
    AvailabilityAssessmentSerializer,
)

from ai_modules.eligibility_engine import check_donor_eligibility
from ai_modules.availability_engine import predict_donor_availability
from ai_modules.gpt_response_generator import format_verified_response
from neo4j_service.neo4j_client import Neo4jClient


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

    result = predict_donor_availability(profile, medical_record)

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
        availability_result = predict_donor_availability(profile, medical_record)

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