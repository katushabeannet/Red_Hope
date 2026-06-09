from datetime import date

from ai_modules.availability.availability_engine import predict_availability
from donors.models import DonorMedicalRecord


MIN_DONATION_INTERVAL_DAYS = 90


def get_days_since_last_donation(medical_record):
    if not medical_record or not medical_record.last_donation_date:
        return None

    return (date.today() - medical_record.last_donation_date).days


def get_donor_retention_summary(profile):
    try:
        medical_record = profile.medical_record
    except DonorMedicalRecord.DoesNotExist:
        return {
            "has_medical_record": False,
            "can_send_reminder": False,
            "reminder_type": "missing_medical_record",
            "title": "Medical Record Pending",
            "message": (
                "UBTS has not yet recorded your medical screening information. "
                "Donation readiness reminders will become available after your "
                "medical record is added."
            ),
            "days_since_last_donation": None,
            "days_remaining": None,
            "availability_result": None,
        }

    days_since_last_donation = get_days_since_last_donation(medical_record)

    if days_since_last_donation is None:
        availability_result = predict_availability(profile, medical_record)

        return {
            "has_medical_record": True,
            "can_send_reminder": availability_result.get("is_available", False),
            "reminder_type": "first_recorded_donation",
            "title": "Donation Readiness",
            "message": (
                "Your medical record is available. UBTS can use your profile "
                "to guide future donation readiness reminders."
            ),
            "days_since_last_donation": None,
            "days_remaining": 0,
            "availability_result": availability_result,
        }

    days_remaining = max(MIN_DONATION_INTERVAL_DAYS - days_since_last_donation, 0)
    availability_result = predict_availability(profile, medical_record)

    if days_remaining == 0 and availability_result.get("is_available"):
        return {
            "has_medical_record": True,
            "can_send_reminder": True,
            "reminder_type": "ready_to_donate",
            "title": "You May Be Ready to Donate Again",
            "message": (
                "Based on your donation history and availability prediction, "
                "you may be ready to donate again. Check nearby UBTS donation "
                "camps when you are available."
            ),
            "days_since_last_donation": days_since_last_donation,
            "days_remaining": 0,
            "availability_result": availability_result,
        }

    return {
        "has_medical_record": True,
        "can_send_reminder": False,
        "reminder_type": "not_yet_due",
        "title": "Next Donation Reminder",
        "message": (
            f"You have approximately {days_remaining} day(s) remaining before "
            "your next expected donation reminder."
        ),
        "days_since_last_donation": days_since_last_donation,
        "days_remaining": days_remaining,
        "availability_result": availability_result,
    }


def get_admin_retention_list(donor_profiles):
    reminders = []

    for profile in donor_profiles:
        summary = get_donor_retention_summary(profile)

        if summary["can_send_reminder"]:
            reminders.append(
                {
                    "donor_id": profile.id,
                    "full_name": profile.user.full_name,
                    "email": profile.user.email,
                    "phone_number": profile.phone_number,
                    "address": profile.address,
                    "blood_group": profile.blood_group,
                    "reminder_type": summary["reminder_type"],
                    "message": summary["message"],
                    "days_since_last_donation": summary["days_since_last_donation"],
                }
            )

    return reminders