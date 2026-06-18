from datetime import timedelta

import requests
from django.conf import settings
from django.utils import timezone


def normalize_whatsapp_number(phone_number):
    """Normalize to international format without leading +."""
    if not phone_number:
        return None

    phone = str(phone_number).strip().replace(" ", "").replace("-", "")

    if phone.startswith("+"):
        return phone[1:]

    if phone.startswith("256"):
        return phone

    if phone.startswith("07") and len(phone) == 10:
        return f"256{phone[1:]}"

    return phone


def _is_whatsapp_enabled():
    try:
        from .models import WhatsAppSetting
        return WhatsAppSetting.get_setting().whatsapp_enabled
    except Exception:
        return getattr(settings, "SEND_WHATSAPP_NOTIFICATIONS", False)


def _is_duplicate_wa(phone_number, message, window_minutes=5):
    try:
        from .models import WhatsAppLog
        cutoff = timezone.now() - timedelta(minutes=window_minutes)
        return WhatsAppLog.objects.filter(
            phone_number=phone_number,
            message=message,
            status="SENT",
            created_at__gte=cutoff,
        ).exists()
    except Exception:
        return False


def _log_wa(phone_number, message, status, template_name="", message_type="text",
            error_message="", response_data=None, wa_message_id="", recipient=None):
    try:
        from .models import WhatsAppLog
        WhatsAppLog.objects.create(
            phone_number=phone_number,
            message=message,
            template_name=template_name or "",
            message_type=message_type,
            status=status,
            error_message=error_message or "",
            response_data=response_data,
            wa_message_id=wa_message_id or "",
            recipient=recipient,
        )
    except Exception:
        pass


def send_whatsapp_text(phone_number, message, recipient=None):
    """Send a free-text WhatsApp message via Meta Cloud API."""
    if not _is_whatsapp_enabled():
        _log_wa(phone_number, message, "SKIPPED", error_message="WhatsApp notifications are disabled.", recipient=recipient)
        return {"success": False, "skipped": True, "message": "WhatsApp notifications are disabled."}

    access_token = getattr(settings, "WHATSAPP_ACCESS_TOKEN", "")
    phone_number_id = getattr(settings, "WHATSAPP_PHONE_NUMBER_ID", "")

    if not access_token or not phone_number_id:
        _log_wa(phone_number, message, "SKIPPED", error_message="WhatsApp credentials not configured.", recipient=recipient)
        return {"success": False, "skipped": True, "message": "WhatsApp credentials not configured."}

    normalized = normalize_whatsapp_number(phone_number)
    if not normalized:
        _log_wa(phone_number, message, "SKIPPED", error_message="Invalid phone number.", recipient=recipient)
        return {"success": False, "skipped": True, "message": "Invalid phone number."}

    text_body = str(message).strip()[:4096]

    if _is_duplicate_wa(normalized, text_body):
        _log_wa(normalized, text_body, "SKIPPED", error_message="Duplicate suppressed.", recipient=recipient)
        return {"success": False, "skipped": True, "message": "Duplicate — already sent within 5 minutes."}

    url = f"https://graph.facebook.com/v19.0/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": normalized,
        "type": "text",
        "text": {"body": text_body},
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=20)
        try:
            data = response.json()
        except ValueError:
            data = {"raw_response": response.text}

        success = response.status_code in (200, 201) and "messages" in data
        wa_id = ""
        if success and data.get("messages"):
            wa_id = data["messages"][0].get("id", "")

        status_str = "SENT" if success else "FAILED"
        _log_wa(normalized, text_body, status_str,
                message_type="text",
                error_message="" if success else str(data),
                response_data=data,
                wa_message_id=wa_id,
                recipient=recipient)

        return {"success": success, "status_code": response.status_code, "response": data, "wa_message_id": wa_id}

    except requests.RequestException as exc:
        _log_wa(normalized, text_body, "FAILED", error_message=str(exc), recipient=recipient)
        return {"success": False, "error": str(exc)}


def send_whatsapp_template(phone_number, template_name, language_code="en_US",
                           components=None, recipient=None):
    """Send a pre-approved WhatsApp template message."""
    if not _is_whatsapp_enabled():
        _log_wa(phone_number, f"[template:{template_name}]", "SKIPPED",
                template_name=template_name,
                error_message="WhatsApp notifications are disabled.", recipient=recipient)
        return {"success": False, "skipped": True, "message": "WhatsApp notifications are disabled."}

    access_token = getattr(settings, "WHATSAPP_ACCESS_TOKEN", "")
    phone_number_id = getattr(settings, "WHATSAPP_PHONE_NUMBER_ID", "")

    if not access_token or not phone_number_id:
        _log_wa(phone_number, f"[template:{template_name}]", "SKIPPED",
                template_name=template_name,
                error_message="WhatsApp credentials not configured.", recipient=recipient)
        return {"success": False, "skipped": True, "message": "WhatsApp credentials not configured."}

    normalized = normalize_whatsapp_number(phone_number)
    if not normalized:
        return {"success": False, "skipped": True, "message": "Invalid phone number."}

    url = f"https://graph.facebook.com/v19.0/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    template_payload = {
        "name": template_name,
        "language": {"code": language_code},
    }
    if components:
        template_payload["components"] = components

    payload = {
        "messaging_product": "whatsapp",
        "to": normalized,
        "type": "template",
        "template": template_payload,
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=20)
        try:
            data = response.json()
        except ValueError:
            data = {"raw_response": response.text}

        success = response.status_code in (200, 201) and "messages" in data
        wa_id = ""
        if success and data.get("messages"):
            wa_id = data["messages"][0].get("id", "")

        status_str = "SENT" if success else "FAILED"
        _log_wa(normalized, f"[template:{template_name}]", status_str,
                template_name=template_name,
                message_type="template",
                error_message="" if success else str(data),
                response_data=data,
                wa_message_id=wa_id,
                recipient=recipient)

        return {"success": success, "status_code": response.status_code, "response": data}

    except requests.RequestException as exc:
        _log_wa(normalized, f"[template:{template_name}]", "FAILED",
                template_name=template_name, message_type="template",
                error_message=str(exc), recipient=recipient)
        return {"success": False, "error": str(exc)}
