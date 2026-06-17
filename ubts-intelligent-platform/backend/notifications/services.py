import math

from django.apps import apps

from donors.models import DonorProfile, DonorMedicalRecord
from donors.retention_engine import get_donor_retention_summary
from donors.impact_engine import get_donor_impact_summary
from ai_modules.eligibility.eligibility_engine import check_donor_eligibility
from ai_modules.availability.availability_engine import predict_availability

from .models import Notification, BloodDemandAlert

from django.conf import settings
from django.core.mail import send_mail
from .sms_service import send_sms_notification


def create_notification(
    recipient,
    title,
    message,
    notification_type="SYSTEM",
    target_role="DONOR",
    action_label="",
    action_url="",
):
    existing = Notification.objects.filter(
        recipient=recipient,
        title=title,
        message=message,
        is_read=False,
    ).first()

    if existing:
        return existing, False

    notification = Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        notification_type=notification_type,
        target_role=target_role,
        action_label=action_label,
        action_url=action_url,
    )

    send_email_notification(
        recipient=recipient,
        title=title,
        message=message,
    )
    
    donor_profile = getattr(recipient, "donor_profile", None)

    if donor_profile and donor_profile.phone_number:
        send_sms_notification(
            phone_number=donor_profile.phone_number,
            message=f"{title}: {message}",
        )

    return notification, True


def generate_retention_notification_for_donor(profile):
    summary = get_donor_retention_summary(profile)

    if not summary.get("can_send_reminder"):
        return None, False

    return create_notification(
        recipient=profile.user,
        title=summary.get("title", "Donation Reminder"),
        message=summary.get("message", "You may be ready to donate again."),
        notification_type="RETENTION",
        action_label="Find Nearby Camp",
        action_url="/donor-dashboard",
    )


def generate_badge_notification_for_donor(profile):
    impact = get_donor_impact_summary(profile)
    badges = impact.get("badges", [])

    if not badges:
        return None, False

    latest_badge = badges[-1]

    return create_notification(
        recipient=profile.user,
        title=f"Badge Earned: {latest_badge.get('badge_name')}",
        message=latest_badge.get(
            "badge_description",
            "You have earned a new donor achievement badge.",
        ),
        notification_type="BADGE",
        action_label="View Dashboard",
        action_url="/donor-dashboard",
    )


def generate_all_donor_notifications(profile):
    created_notifications = []

    retention_notification, retention_created = generate_retention_notification_for_donor(
        profile
    )

    if retention_created and retention_notification:
        created_notifications.append(retention_notification)

    badge_notification, badge_created = generate_badge_notification_for_donor(profile)

    if badge_created and badge_notification:
        created_notifications.append(badge_notification)

    return created_notifications


def get_camp_model():
    try:
        return apps.get_model("camps", "DonationCamp")
    except LookupError:
        return apps.get_model("camps", "Camp")


def get_camp_display_name(camp):
    return (
        getattr(camp, "name", None)
        or getattr(camp, "title", None)
        or f"Donation Camp #{camp.id}"
    )


def get_camp_location_text(camp):
    venue = getattr(camp, "venue", "") or ""
    district = getattr(camp, "district", "") or ""
    region = getattr(camp, "region", "") or ""

    return ", ".join([item for item in [venue, district, region] if item])


def haversine_distance_km(lat1, lon1, lat2, lon2):
    radius = 6371

    lat1 = math.radians(float(lat1))
    lon1 = math.radians(float(lon1))
    lat2 = math.radians(float(lat2))
    lon2 = math.radians(float(lon2))

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(radius * c, 2)


def donor_is_campaign_ready(profile):
    try:
        medical_record = profile.medical_record
    except DonorMedicalRecord.DoesNotExist:
        return False, None, None

    eligibility = check_donor_eligibility(profile, medical_record)
    availability = predict_availability(profile, medical_record)

    return (
        eligibility.get("is_eligible", False),
        eligibility,
        availability,
    )


def generate_nearby_camp_notifications(camp_id, radius_km=10):
    CampModel = get_camp_model()
    camp = CampModel.objects.filter(id=camp_id).first()

    if not camp:
        return {
            "error": "Donation camp not found.",
            "created_count": 0,
            "created_notifications": [],
        }

    camp_latitude = getattr(camp, "latitude", None)
    camp_longitude = getattr(camp, "longitude", None)

    if camp_latitude is None or camp_longitude is None:
        return {
            "error": "Selected camp does not have latitude and longitude.",
            "created_count": 0,
            "created_notifications": [],
        }

    created_notifications = []
    camp_name = get_camp_display_name(camp)
    camp_location = get_camp_location_text(camp)

    donors = DonorProfile.objects.select_related("user").exclude(
        latitude__isnull=True,
    ).exclude(
        longitude__isnull=True,
    )

    for profile in donors:
        distance_km = haversine_distance_km(
            camp_latitude,
            camp_longitude,
            profile.latitude,
            profile.longitude,
        )

        if distance_km > float(radius_km):
            continue

        is_eligible, eligibility, availability = donor_is_campaign_ready(profile)

        if not is_eligible:
            continue

        title = "Blood Donation Camp Near You"
        message = (
            f"A UBTS blood donation camp is available near you at {camp_name}. "
            f"{camp_location}. You are approximately {distance_km} km away. "
            "You may visit the camp if you are available and ready to donate."
        )

        notification, created = create_notification(
            recipient=profile.user,
            title=title,
            message=message,
            notification_type="CAMP",
            action_label="View Dashboard",
            action_url="/donor-dashboard",
        )

        if created:
            created_notifications.append(notification)

    return {
        "error": None,
        "created_count": len(created_notifications),
        "created_notifications": created_notifications,
    }


def generate_blood_demand_notifications(
    blood_group,
    title,
    message,
    created_by=None,
):
    alert = BloodDemandAlert.objects.create(
        blood_group=blood_group,
        title=title,
        message=message,
        created_by=created_by,
    )

    created_notifications = []

    donors = DonorProfile.objects.select_related("user").filter(
        blood_group=blood_group,
    )

    for profile in donors:
        is_eligible, eligibility, availability = donor_is_campaign_ready(profile)

        if not is_eligible:
            continue

        notification_message = (
            f"{message} UBTS currently needs {blood_group} blood donors. "
            "Your donation may help save lives."
        )

        notification, created = create_notification(
            recipient=profile.user,
            title=title,
            message=notification_message,
            notification_type="BLOOD_DEMAND",
            action_label="Open Dashboard",
            action_url="/donor-dashboard",
        )

        if created:
            created_notifications.append(notification)

    return {
        "alert": alert,
        "created_count": len(created_notifications),
        "created_notifications": created_notifications,
    }
    
    
def send_email_notification(recipient, title, message):
    if not getattr(settings, "SEND_EMAIL_NOTIFICATIONS", False):
        return False

    if not recipient or not recipient.email:
        return False

    try:
        send_mail(
            subject=title,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient.email],
            fail_silently=True,
        )
        return True
    except Exception as error:
        print("Email notification failed:", error)
        return False