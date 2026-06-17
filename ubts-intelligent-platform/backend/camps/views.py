from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from .models import DonationCamp
from .serializers import DonationCampSerializer
from ai_modules.geo_recommender import find_nearest_camp
from ai_modules.gpt_response_generator import format_verified_response
from neo4j_service.neo4j_client import Neo4jClient


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

    active_camps = DonationCamp.objects.filter(
        status=DonationCamp.CampStatus.ACTIVE
    )

    result = find_nearest_camp(latitude, longitude, active_camps)

    if result is None:
        return Response(
            {"message": "No active donation camp is currently available."},
            status=status.HTTP_404_NOT_FOUND,
        )

    nearest_camp = result["camp"]
    distance_km = result["distance_km"]
    camp_data = DonationCampSerializer(nearest_camp).data

    if request.user.is_authenticated:
        user_identifier = request.user.email
        user_type = getattr(request.user, "role", "AUTHENTICATED")
    else:
        user_identifier = "guest-user"
        user_type = "GUEST"

    try:
        neo4j_client = Neo4jClient()
        neo4j_client.create_nearest_camp_trace(
            user_identifier=user_identifier,
            user_type=user_type,
            latitude=float(latitude),
            longitude=float(longitude),
            camp_id=nearest_camp.id,
            camp_name=nearest_camp.name,
            district=nearest_camp.district,
            venue=nearest_camp.venue,
            camp_latitude=nearest_camp.latitude,
            camp_longitude=nearest_camp.longitude,
            distance_km=distance_km,
        )
        neo4j_client.close()
    except Exception as e:
        print("Neo4j nearest camp trace failed:", e)

    verified_data = {
        "nearest_camp": camp_data,
        "distance_km": distance_km,
    }

    assistant_response = format_verified_response(
        "nearest_camp",
        verified_data,
    )

    return Response(
        {
            "nearest_camp": camp_data,
            "distance_km": distance_km,
            "assistant_response": assistant_response,
        }
    )


@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAdminUser])
def admin_camps_view(request):
    if request.method == "GET":
        camps = DonationCamp.objects.all()
        serializer = DonationCampSerializer(camps, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        serializer = DonationCampSerializer(data=request.data)
        if serializer.is_valid():
            camp = serializer.save()
            return Response(
                DonationCampSerializer(camp).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    camp_id = request.data.get("id")

    if not camp_id:
        return Response(
            {"error": "Camp ID is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        camp = DonationCamp.objects.get(id=camp_id)
    except DonationCamp.DoesNotExist:
        return Response(
            {"error": "Donation camp not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "PUT":
        serializer = DonationCampSerializer(camp, data=request.data, partial=True)
        if serializer.is_valid():
            camp = serializer.save()
            return Response(DonationCampSerializer(camp).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        camp.delete()
        return Response({"message": "Donation camp deleted successfully."})


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def reschedule_camp_view(request, camp_id):
    try:
        camp = DonationCamp.objects.get(id=camp_id)
    except DonationCamp.DoesNotExist:
        return Response(
            {"error": "Donation camp not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    start_date = request.data.get("start_date")
    end_date = request.data.get("end_date")

    if start_date:
        camp.start_date = start_date
    if end_date:
        camp.end_date = end_date

    camp.save(update_fields=["start_date", "end_date"])
    serializer = DonationCampSerializer(camp)
    return Response(serializer.data)