from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from donors.models import DonorProfile

from .models import Notification
from .serializers import NotificationSerializer
from .services import generate_all_donor_notifications


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
    notifications = Notification.objects.all()
    serializer = NotificationSerializer(notifications, many=True)

    return Response(
        {
            "total_notifications": notifications.count(),
            "unread_notifications": notifications.filter(is_read=False).count(),
            "notifications": serializer.data,
        }
    )