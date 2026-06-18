from datetime import timedelta

import requests
from django.conf import settings
from django.utils import timezone


def normalize_ugandan_phone_number(phone_number):
    if not phone_number:
        return None

    phone = str(phone_number).strip().replace(" ", "").replace("-", "")

    if phone.startswith("+256"):
        return phone

    if phone.startswith("256"):
        return f"+{phone}"

    if phone.startswith("07") and len(phone) == 10:
        return f"+256{phone[1:]}"

    return phone


def get_ugsms_send_url():
    if getattr(settings, "UGSMS_SANDBOX", True):
        return "https://www.ugsms.com/api/v2/sandbox/sms/send"

    return "https://www.ugsms.com/api/v2/sms/send"


def _is_sms_globally_enabled():
    """Check DB toggle first, then fall back to settings.py."""
    try:
        from .models import SMSSetting
        return SMSSetting.get_setting().sms_enabled
    except Exception:
        return getattr(settings, "SEND_SMS_NOTIFICATIONS", False)


def _is_duplicate(phone_number, message, window_minutes=5):
    """Return True if an identical SMS was already sent within the window."""
    try:
        from .models import SMSLog
        cutoff = timezone.now() - timedelta(minutes=window_minutes)
        return SMSLog.objects.filter(
            phone_number=phone_number,
            message=message,
            status="SENT",
            created_at__gte=cutoff,
        ).exists()
    except Exception:
        return False


def _log_sms(phone_number, message, status, error_message="", response_data=None, recipient=None):
    try:
        from .models import SMSLog
        SMSLog.objects.create(
            phone_number=phone_number,
            message=message,
            status=status,
            error_message=error_message or "",
            response_data=response_data,
            recipient=recipient,
        )
    except Exception:
        pass


def send_sms_notification(phone_number, message, recipient=None):
    if not _is_sms_globally_enabled():
        _log_sms(phone_number, message, "SKIPPED", "SMS notifications are disabled.")
        return {
            "success": False,
            "skipped": True,
            "message": "SMS notifications are disabled.",
        }

    api_key = getattr(settings, "UGSMS_API_KEY", "")
    sender_id = getattr(settings, "UGSMS_SENDER_ID", "UBTS")

    if not api_key:
        _log_sms(phone_number, message, "SKIPPED", "UGSMS API key is missing.", recipient=recipient)
        return {
            "success": False,
            "skipped": True,
            "message": "UGSMS API key is missing.",
        }

    normalized_phone = normalize_ugandan_phone_number(phone_number)

    if not normalized_phone:
        _log_sms(phone_number, message, "SKIPPED", "Recipient phone number is missing.", recipient=recipient)
        return {
            "success": False,
            "skipped": True,
            "message": "Recipient phone number is missing.",
        }

    sms_message = str(message).strip()
    if len(sms_message) > 300:
        sms_message = sms_message[:297] + "..."

    if _is_duplicate(normalized_phone, sms_message):
        _log_sms(normalized_phone, sms_message, "SKIPPED", "Duplicate SMS suppressed.", recipient=recipient)
        return {
            "success": False,
            "skipped": True,
            "message": "Duplicate SMS — already sent within last 5 minutes.",
        }

    payload = {
        "numbers": normalized_phone,
        "message_body": sms_message,
        "sender_id": sender_id[:11],
    }

    headers = {
        "X-API-Key": api_key,
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            get_ugsms_send_url(),
            json=payload,
            headers=headers,
            timeout=20,
        )

        try:
            data = response.json()
        except ValueError:
            data = {"raw_response": response.text}

        success = response.status_code in [200, 201] and data.get("success", False)
        status_str = "SENT" if success else "FAILED"
        error_msg = "" if success else str(data)

        _log_sms(normalized_phone, sms_message, status_str, error_msg, data, recipient=recipient)

        return {
            "success": success,
            "status_code": response.status_code,
            "response": data,
        }

    except requests.RequestException as error:
        _log_sms(normalized_phone, sms_message, "FAILED", str(error), recipient=recipient)
        return {
            "success": False,
            "error": str(error),
        }
