import requests
from django.conf import settings


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


def send_sms_notification(phone_number, message):
    if not getattr(settings, "SEND_SMS_NOTIFICATIONS", False):
        return {
            "success": False,
            "skipped": True,
            "message": "SMS notifications are disabled.",
        }

    api_key = getattr(settings, "UGSMS_API_KEY", "")
    sender_id = getattr(settings, "UGSMS_SENDER_ID", "UBTS")

    if not api_key:
        return {
            "success": False,
            "skipped": True,
            "message": "UGSMS API key is missing.",
        }

    normalized_phone = normalize_ugandan_phone_number(phone_number)

    if not normalized_phone:
        return {
            "success": False,
            "skipped": True,
            "message": "Recipient phone number is missing.",
        }

    sms_message = str(message).strip()

    if len(sms_message) > 300:
        sms_message = sms_message[:297] + "..."

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

        return {
            "success": response.status_code in [200, 201] and data.get("success", False),
            "status_code": response.status_code,
            "response": data,
        }

    except requests.RequestException as error:
        return {
            "success": False,
            "error": str(error),
        }