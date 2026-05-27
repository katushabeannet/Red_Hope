from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import DonorProfile, DonorMedicalRecord
from .serializers import DonorProfileSerializer, DonorMedicalRecordSerializer


@api_view(["GET", "POST", "PUT"])
@permission_classes([IsAuthenticated])
def donor_profile_view(request):
    profile = DonorProfile.objects.filter(user=request.user).first()

    if request.method == "GET":
        if not profile:
            return Response({"message": "No donor profile found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DonorProfileSerializer(profile)
        return Response(serializer.data)

    if request.method == "POST":
        if profile:
            return Response({"error": "Donor profile already exists."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = DonorProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "PUT":
        if not profile:
            return Response({"error": "No donor profile found to update."}, status=status.HTTP_404_NOT_FOUND)

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
        return Response({"error": "Create donor profile first."}, status=status.HTTP_400_BAD_REQUEST)

    record = DonorMedicalRecord.objects.filter(donor=profile).first()

    if request.method == "GET":
        if not record:
            return Response({"message": "No medical record found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DonorMedicalRecordSerializer(record)
        return Response(serializer.data)

    if request.method == "POST":
        if record:
            return Response({"error": "Medical record already exists."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = DonorMedicalRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(donor=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "PUT":
        if not record:
            return Response({"error": "No medical record found to update."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DonorMedicalRecordSerializer(record, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)