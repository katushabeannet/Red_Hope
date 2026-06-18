from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from donors.models import DonorProfile

from .models import Notification, BloodDemandAlert, SMSLog, SMSSetting, WhatsAppLog, WhatsAppSetting
from .serializers import NotificationSerializer, BloodDemandAlertSerializer, SMSLogSerializer, WhatsAppLogSerializer
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
    campaign_performance_id = request.data.get("campaign_performance_id")

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

    if campaign_performance_id:
        try:
            from campaigns.models import CampaignPerformance, CampaignResponse
            perf = CampaignPerformance.objects.get(id=campaign_performance_id)
            perf.contacted_donors = sent_count
            perf.save(update_fields=["contacted_donors"])

            for profile in profiles:
                CampaignResponse.objects.get_or_create(
                    campaign=perf,
                    donor=profile,
                    defaults={"status": "CONTACTED", "recorded_by": request.user},
                )
        except Exception:
            pass

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
    blood_group = (request.data.get("blood_group") or "").strip()
    title = (request.data.get("title") or "").strip()
    message = (request.data.get("message") or "").strip()
    urgency_level = (request.data.get("urgency_level") or "HIGH").strip().upper()
    units_needed = int(request.data.get("units_needed") or 1)
    hospital_name = (request.data.get("hospital_name") or "").strip()

    for field, val in [("blood_group", blood_group), ("title", title), ("message", message)]:
        if not val:
            return Response({"error": f"{field} is required."}, status=400)

    if urgency_level not in ("CRITICAL", "HIGH", "MEDIUM", "LOW"):
        urgency_level = "HIGH"

    result = generate_blood_demand_notifications(
        blood_group=blood_group,
        title=title,
        message=message,
        created_by=request.user,
        urgency_level=urgency_level,
        units_needed=units_needed,
        hospital_name=hospital_name,
    )

    return Response(
        {
            "message": "Blood demand alert created and donors notified.",
            "alert": BloodDemandAlertSerializer(result["alert"]).data,
            "notified_count": result["created_count"],
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def blood_demand_alerts_list_view(request):
    from django.db.models import Q as DQ
    import math as _math

    status_filter = request.query_params.get("status", "").strip().upper()
    bg_filter = request.query_params.get("blood_group", "").strip()
    urgency_filter = request.query_params.get("urgency_level", "").strip().upper()
    search = request.query_params.get("search", "").strip()
    page = max(1, int(request.query_params.get("page", 1)))
    page_size = min(100, max(1, int(request.query_params.get("page_size", 20))))

    alerts = BloodDemandAlert.objects.select_related("created_by")

    if status_filter in ("ACTIVE", "RESOLVED"):
        alerts = alerts.filter(status=status_filter)
    if bg_filter:
        alerts = alerts.filter(blood_group=bg_filter)
    if urgency_filter in ("CRITICAL", "HIGH", "MEDIUM", "LOW"):
        alerts = alerts.filter(urgency_level=urgency_filter)
    if search:
        alerts = alerts.filter(
            DQ(title__icontains=search) | DQ(message__icontains=search) | DQ(hospital_name__icontains=search)
        )

    total = alerts.count()
    start = (page - 1) * page_size
    page_alerts = alerts[start: start + page_size]

    return Response({
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": _math.ceil(total / page_size) if total else 1,
        "active_count": BloodDemandAlert.objects.filter(status="ACTIVE").count(),
        "resolved_count": BloodDemandAlert.objects.filter(status="RESOLVED").count(),
        "alerts": BloodDemandAlertSerializer(page_alerts, many=True).data,
    })


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAdminUser])
def blood_demand_alert_detail_view(request, alert_id):
    try:
        alert = BloodDemandAlert.objects.get(id=alert_id)
    except BloodDemandAlert.DoesNotExist:
        return Response({"error": "Alert not found."}, status=404)

    if request.method == "GET":
        return Response(BloodDemandAlertSerializer(alert).data)

    if request.method == "PATCH":
        allowed = ["title", "message", "urgency_level", "units_needed", "hospital_name", "status"]
        for field in allowed:
            if field in request.data:
                val = request.data[field]
                if field == "urgency_level":
                    val = (val or "HIGH").upper()
                    if val not in ("CRITICAL", "HIGH", "MEDIUM", "LOW"):
                        continue
                if field == "status":
                    val = (val or "ACTIVE").upper()
                    if val not in ("ACTIVE", "RESOLVED"):
                        continue
                    if val == "RESOLVED" and alert.status != "RESOLVED":
                        from django.utils import timezone
                        alert.resolved_at = timezone.now()
                    elif val == "ACTIVE":
                        alert.resolved_at = None
                setattr(alert, field, val)
        alert.save()
        return Response(BloodDemandAlertSerializer(alert).data)

    if request.method == "DELETE":
        alert.delete()
        return Response({"message": "Alert deleted."}, status=204)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def blood_demand_alert_resolve_view(request, alert_id):
    from django.utils import timezone
    try:
        alert = BloodDemandAlert.objects.get(id=alert_id)
    except BloodDemandAlert.DoesNotExist:
        return Response({"error": "Alert not found."}, status=404)

    if alert.status == "ACTIVE":
        alert.status = "RESOLVED"
        alert.resolved_at = timezone.now()
    else:
        alert.status = "ACTIVE"
        alert.resolved_at = None
    alert.save(update_fields=["status", "resolved_at"])

    return Response({
        "message": f"Alert marked as {alert.status}.",
        "alert": BloodDemandAlertSerializer(alert).data,
    })


@api_view(["POST"])
@permission_classes([IsAdminUser])
def blood_demand_alert_notify_view(request, alert_id):
    """Re-send notifications to matching eligible donors for an existing alert."""
    try:
        alert = BloodDemandAlert.objects.get(id=alert_id)
    except BloodDemandAlert.DoesNotExist:
        return Response({"error": "Alert not found."}, status=404)

    if alert.status == "RESOLVED":
        return Response({"error": "Cannot re-notify for a resolved alert."}, status=400)

    from .services import donor_is_campaign_ready

    donors = DonorProfile.objects.select_related("user").filter(blood_group=alert.blood_group)
    sent = 0
    for profile in donors:
        is_eligible, _, _ = donor_is_campaign_ready(profile)
        if not is_eligible:
            continue
        hospital_note = f" at {alert.hospital_name}" if alert.hospital_name else ""
        msg = (
            f"[{alert.urgency_level}] {alert.message} UBTS needs {alert.blood_group} blood"
            f"{hospital_note}. {alert.units_needed} unit(s) required."
        )
        _, created = create_notification(
            recipient=profile.user,
            title=alert.title,
            message=msg,
            notification_type="BLOOD_DEMAND",
            action_label="View Alert",
            action_url="/blood-demand-alerts",
        )
        if created:
            sent += 1

    alert.notified_count = (alert.notified_count or 0) + sent
    alert.save(update_fields=["notified_count"])

    return Response({"message": f"Re-notified {sent} donor(s).", "notified": sent})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def donor_blood_demand_alerts_view(request):
    """Donor-facing: active alerts (all groups or their specific group)."""
    from donors.models import DonorProfile as DP
    profile = DP.objects.filter(user=request.user).first()
    bg = profile.blood_group if profile else None

    alerts = BloodDemandAlert.objects.filter(status="ACTIVE")
    if bg:
        from django.db.models import Q as DQ
        alerts = alerts.filter(DQ(blood_group=bg) | DQ(blood_group="ALL"))

    return Response({
        "donor_blood_group": bg,
        "alerts": BloodDemandAlertSerializer(alerts, many=True).data,
    })


# ── SMS Admin Views ─────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_sms_settings_view(request):
    setting = SMSSetting.get_setting()
    return Response({
        "sms_enabled": setting.sms_enabled,
        "updated_at": setting.updated_at,
        "updated_by": getattr(setting.updated_by, "email", None),
    })


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_sms_toggle_view(request):
    enabled = request.data.get("sms_enabled")
    if enabled is None:
        return Response({"error": "sms_enabled (bool) is required."}, status=400)

    setting = SMSSetting.get_setting()
    setting.sms_enabled = bool(enabled)
    setting.updated_by = request.user
    setting.save()

    return Response({
        "message": f"SMS notifications {'enabled' if setting.sms_enabled else 'disabled'}.",
        "sms_enabled": setting.sms_enabled,
    })


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_sms_test_view(request):
    import math
    phone = (request.data.get("phone_number") or "").strip()
    message = (request.data.get("message") or "").strip()

    if not phone:
        return Response({"error": "phone_number is required."}, status=400)
    if not message:
        message = "This is a test SMS from the UBTS Blood Donation Platform. System is working correctly."

    from .sms_service import send_sms_notification
    result = send_sms_notification(phone_number=phone, message=message, recipient=request.user)

    return Response({
        "phone_number": phone,
        "success": result.get("success", False),
        "skipped": result.get("skipped", False),
        "detail": result.get("message") or result.get("error") or str(result.get("response", "")),
    })


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_sms_logs_view(request):
    import math as _math
    search = request.query_params.get("search", "").strip()
    status_filter = request.query_params.get("status", "").strip().upper()
    page = max(1, int(request.query_params.get("page", 1)))
    page_size = min(100, max(1, int(request.query_params.get("page_size", 30))))

    from django.db.models import Q as DQ
    logs = SMSLog.objects.select_related("recipient")

    if status_filter in ("SENT", "FAILED", "SKIPPED"):
        logs = logs.filter(status=status_filter)

    if search:
        logs = logs.filter(
            DQ(phone_number__icontains=search)
            | DQ(message__icontains=search)
            | DQ(recipient__email__icontains=search)
        )

    total = logs.count()
    start = (page - 1) * page_size
    page_logs = logs[start: start + page_size]
    serializer = SMSLogSerializer(page_logs, many=True)

    sent_count = SMSLog.objects.filter(status="SENT").count()
    failed_count = SMSLog.objects.filter(status="FAILED").count()
    skipped_count = SMSLog.objects.filter(status="SKIPPED").count()

    return Response({
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": _math.ceil(total / page_size) if total else 1,
        "sent_count": sent_count,
        "failed_count": failed_count,
        "skipped_count": skipped_count,
        "logs": serializer.data,
    })


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_sms_bulk_view(request):
    donor_ids = request.data.get("donor_ids", [])
    message = (request.data.get("message") or "").strip()

    if not message:
        return Response({"error": "message is required."}, status=400)
    if not donor_ids:
        return Response({"error": "donor_ids list is required."}, status=400)

    profiles = DonorProfile.objects.filter(id__in=donor_ids).select_related("user")

    from .sms_service import send_sms_notification
    sent, failed, skipped = 0, 0, 0

    for profile in profiles:
        phone = profile.phone_number
        if not phone:
            skipped += 1
            continue
        result = send_sms_notification(
            phone_number=phone,
            message=message,
            recipient=profile.user,
        )
        if result.get("skipped"):
            skipped += 1
        elif result.get("success"):
            sent += 1
        else:
            failed += 1

    return Response({
        "message": f"Bulk SMS complete. Sent: {sent}, Failed: {failed}, Skipped: {skipped}.",
        "sent": sent,
        "failed": failed,
        "skipped": skipped,
        "total_targeted": len(donor_ids),
    })


# ── WhatsApp Admin Views ─────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_whatsapp_settings_view(request):
    setting = WhatsAppSetting.get_setting()
    return Response({
        "whatsapp_enabled": setting.whatsapp_enabled,
        "updated_at": setting.updated_at,
        "updated_by": getattr(setting.updated_by, "email", None),
    })


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_whatsapp_toggle_view(request):
    enabled = request.data.get("whatsapp_enabled")
    if enabled is None:
        return Response({"error": "whatsapp_enabled (bool) is required."}, status=400)

    setting = WhatsAppSetting.get_setting()
    setting.whatsapp_enabled = bool(enabled)
    setting.updated_by = request.user
    setting.save()

    return Response({
        "message": f"WhatsApp notifications {'enabled' if setting.whatsapp_enabled else 'disabled'}.",
        "whatsapp_enabled": setting.whatsapp_enabled,
    })


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_whatsapp_test_view(request):
    phone = (request.data.get("phone_number") or "").strip()
    message = (request.data.get("message") or "").strip()
    use_template = request.data.get("use_template", False)
    template_name = (request.data.get("template_name") or "").strip()

    if not phone:
        return Response({"error": "phone_number is required."}, status=400)

    from .whatsapp_service import send_whatsapp_text, send_whatsapp_template

    if use_template and template_name:
        result = send_whatsapp_template(
            phone_number=phone,
            template_name=template_name,
            recipient=request.user,
        )
    else:
        if not message:
            message = "This is a test WhatsApp message from the UBTS Blood Donation Platform."
        result = send_whatsapp_text(phone_number=phone, message=message, recipient=request.user)

    return Response({
        "phone_number": phone,
        "success": result.get("success", False),
        "skipped": result.get("skipped", False),
        "detail": result.get("message") or result.get("error") or str(result.get("response", "")),
    })


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_whatsapp_logs_view(request):
    import math as _math
    from django.db.models import Q as DQ

    search = request.query_params.get("search", "").strip()
    status_filter = request.query_params.get("status", "").strip().upper()
    page = max(1, int(request.query_params.get("page", 1)))
    page_size = min(100, max(1, int(request.query_params.get("page_size", 30))))

    logs = WhatsAppLog.objects.select_related("recipient")

    if status_filter in ("SENT", "FAILED", "SKIPPED"):
        logs = logs.filter(status=status_filter)

    if search:
        logs = logs.filter(
            DQ(phone_number__icontains=search)
            | DQ(message__icontains=search)
            | DQ(template_name__icontains=search)
            | DQ(recipient__email__icontains=search)
        )

    total = logs.count()
    start = (page - 1) * page_size
    page_logs = logs[start: start + page_size]
    serializer = WhatsAppLogSerializer(page_logs, many=True)

    return Response({
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": _math.ceil(total / page_size) if total else 1,
        "sent_count": WhatsAppLog.objects.filter(status="SENT").count(),
        "failed_count": WhatsAppLog.objects.filter(status="FAILED").count(),
        "skipped_count": WhatsAppLog.objects.filter(status="SKIPPED").count(),
        "logs": serializer.data,
    })


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_whatsapp_bulk_view(request):
    donor_ids = request.data.get("donor_ids", [])
    message = (request.data.get("message") or "").strip()
    use_template = request.data.get("use_template", False)
    template_name = (request.data.get("template_name") or "").strip()

    if not donor_ids:
        return Response({"error": "donor_ids list is required."}, status=400)
    if not use_template and not message:
        return Response({"error": "message is required when not using a template."}, status=400)
    if use_template and not template_name:
        return Response({"error": "template_name is required when use_template is true."}, status=400)

    profiles = DonorProfile.objects.filter(
        id__in=donor_ids,
        whatsapp_consent=True,
    ).select_related("user")

    from .whatsapp_service import send_whatsapp_text, send_whatsapp_template
    sent, failed, skipped, no_consent = 0, 0, 0, len(donor_ids) - profiles.count()

    for profile in profiles:
        phone = profile.whatsapp_number or profile.phone_number
        if not phone:
            skipped += 1
            continue

        if use_template:
            result = send_whatsapp_template(
                phone_number=phone,
                template_name=template_name,
                recipient=profile.user,
            )
        else:
            result = send_whatsapp_text(
                phone_number=phone,
                message=message,
                recipient=profile.user,
            )

        if result.get("skipped"):
            skipped += 1
        elif result.get("success"):
            sent += 1
        else:
            failed += 1

    return Response({
        "message": f"Bulk WhatsApp complete. Sent: {sent}, Failed: {failed}, Skipped: {skipped}, No consent: {no_consent}.",
        "sent": sent,
        "failed": failed,
        "skipped": skipped,
        "no_consent": no_consent,
        "total_targeted": len(donor_ids),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def donor_whatsapp_consent_view(request):
    from donors.models import DonorProfile as DP
    profile = DP.objects.filter(user=request.user).first()
    if not profile:
        return Response({"error": "Donor profile not found."}, status=404)

    consent = request.data.get("whatsapp_consent")
    whatsapp_number = (request.data.get("whatsapp_number") or "").strip()

    if consent is not None:
        profile.whatsapp_consent = bool(consent)
    if whatsapp_number:
        profile.whatsapp_number = whatsapp_number

    update_fields = []
    if consent is not None:
        update_fields.append("whatsapp_consent")
    if whatsapp_number:
        update_fields.append("whatsapp_number")

    if update_fields:
        profile.save(update_fields=update_fields)

    return Response({
        "whatsapp_consent": profile.whatsapp_consent,
        "whatsapp_number": profile.whatsapp_number,
    })