from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from donors.models import DonorProfile

from .models import Notification, BloodDemandAlert
from .serializers import NotificationSerializer, BloodDemandAlertSerializer
from .services import (
    create_notification,
    generate_all_donor_notifications,
    generate_nearby_camp_notifications,
    generate_blood_demand_notifications,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_notifications_view(request):
    notifications = Notification.objects.filter(recipient=request.user)
    serializer = NotificationSerializer(notifications, many=True)

    return Response(
        {
            "unread_count": notifications.filter(is_read=False).count(),
            "notifications": serializer.data,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_my_notifications_view(request):
    profile = DonorProfile.objects.filter(user=request.user).first()

    if not profile:
        return Response(
            {"error": "Donor profile not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    generated = generate_all_donor_notifications(profile)

    return Response(
        {
            "message": "Notifications generated successfully.",
            "generated_count": len(generated),
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_notification_read_view(request, notification_id):
    notification = Notification.objects.filter(
        id=notification_id,
        recipient=request.user,
    ).first()

    if not notification:
        return Response(
            {"error": "Notification not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    notification.is_read = True
    notification.save(update_fields=["is_read"])

    return Response({"message": "Notification marked as read."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read_view(request):
    Notification.objects.filter(
        recipient=request.user,
        is_read=False,
    ).update(is_read=True)

    return Response({"message": "All notifications marked as read."})


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_notifications_view(request):
    import math

    search = request.query_params.get("search", "").strip()
    page = max(1, int(request.query_params.get("page", 1)))
    page_size = min(100, max(1, int(request.query_params.get("page_size", 20))))

    from django.db.models import Q
    notifications = Notification.objects.all().order_by("-created_at")

    if search:
        notifications = notifications.filter(
            Q(title__icontains=search)
            | Q(message__icontains=search)
            | Q(recipient__email__icontains=search)
            | Q(recipient__full_name__icontains=search)
        )

    total_count = notifications.count()
    start = (page - 1) * page_size
    page_notifications = notifications[start : start + page_size]
    serializer = NotificationSerializer(page_notifications, many=True)

    return Response(
        {
            "total_notifications": total_count,
            "unread_notifications": Notification.objects.filter(is_read=False).count(),
            "page": page,
            "page_size": page_size,
            "total_pages": math.ceil(total_count / page_size) if total_count else 1,
            "notifications": serializer.data,
        }
    )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def campaign_blast_view(request):
    donor_ids = request.data.get("donor_ids", [])
    title = request.data.get("title", "UBTS Campaign Alert").strip()
    message = request.data.get("message", "").strip()

    if not message:
        return Response(
            {"error": "message is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not donor_ids:
        return Response(
            {"error": "donor_ids list is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    profiles = DonorProfile.objects.filter(id__in=donor_ids).select_related("user")
    sent_count = 0

    for profile in profiles:
        _, created = create_notification(
            recipient=profile.user,
            title=title,
            message=message,
            notification_type="SYSTEM",
            action_label="View Dashboard",
            action_url="/donor-dashboard",
        )
        if created:
            sent_count += 1

    return Response(
        {
            "message": f"Campaign blast sent to {sent_count} donors.",
            "sent_count": sent_count,
            "total_targeted": len(donor_ids),
        }
    )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def generate_camp_proximity_alerts_view(request):
    camp_id = request.data.get("camp_id")
    radius_km = request.data.get("radius_km", 10)

    if not camp_id:
        return Response(
            {"error": "camp_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = generate_nearby_camp_notifications(
        camp_id=camp_id,
        radius_km=radius_km,
    )

    if result.get("error"):
        return Response(
            {"error": result["error"]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": "Camp proximity notifications generated successfully.",
            "created_count": result["created_count"],
        }
    )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def generate_blood_demand_alerts_view(request):
    blood_group = request.data.get("blood_group")
    title = request.data.get("title")
    message = request.data.get("message")

    if not blood_group:
        return Response(
            {"error": "blood_group is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not title:
        return Response(
            {"error": "title is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not message:
        return Response(
            {"error": "message is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = generate_blood_demand_notifications(
        blood_group=blood_group,
        title=title,
        message=message,
        created_by=request.user,
    )

    return Response(
        {
            "message": "Critical blood demand notifications generated successfully.",
            "alert": BloodDemandAlertSerializer(result["alert"]).data,
            "created_count": result["created_count"],
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def blood_demand_alerts_list_view(request):
    alerts = BloodDemandAlert.objects.all()
    serializer = BloodDemandAlertSerializer(alerts, many=True)

    return Response(
        {
            "total_alerts": alerts.count(),
            "alerts": serializer.data,
        }
    )