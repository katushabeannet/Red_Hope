from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from .models import DonationCamp
from .serializers import DonationCampSerializer
from ai_modules.geo_recommender import find_nearest_camp


@api_view(["GET"])
@permission_classes([AllowAny])
def active_camps_view(request):
    camps = DonationCamp.objects.filter(status=DonationCamp.CampStatus.ACTIVE)
    serializer = DonationCampSerializer(camps, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def nearest_camp_view(request):
    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")

    if latitude is None or longitude is None:
        return Response(
            {"error": "Latitude and longitude are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    active_camps = DonationCamp.objects.filter(status=DonationCamp.CampStatus.ACTIVE)

    result = find_nearest_camp(latitude, longitude, active_camps)

    if result is None:
        return Response(
            {"message": "No active donation camp is currently available."},
            status=status.HTTP_404_NOT_FOUND,
        )

    camp_data = DonationCampSerializer(result["camp"]).data

    return Response(
        {
            "nearest_camp": camp_data,
            "distance_km": result["distance_km"],
        }
    )


@api_view(["GET", "POST"])
@permission_classes([IsAdminUser])
def admin_camps_view(request):
    if request.method == "GET":
        camps = DonationCamp.objects.all()
        serializer = DonationCampSerializer(camps, many=True)
        return Response(serializer.data)

    serializer = DonationCampSerializer(data=request.data)
    if serializer.is_valid():
        camp = serializer.save()
        return Response(
            DonationCampSerializer(camp).data,
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)