import math
from datetime import date, timedelta

from django.apps import apps

from donors.models import DonorProfile, DonorMedicalRecord, DonationRecord
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


def generate_eligibility_reminder_for_donor(profile):
    try:
        latest = (
            DonationRecord.objects.filter(donor=profile)
            .order_by("-donation_date")
            .first()
        )
    except Exception:
        return None, False

    if not latest:
        return None, False

    next_eligible = latest.donation_date + timedelta(days=90)
    today = date.today()
    days_until = (next_eligible - today).days

    if days_until < 0 or days_until > 14:
        return None, False

    if days_until == 0:
        message = "You are eligible to donate blood again today! Visit a nearby camp and help save lives."
    elif days_until <= 7:
        message = (
            f"You will be eligible to donate blood again in {days_until} day(s) "
            f"(on {next_eligible.strftime('%d %b %Y')}). Start planning your visit!"
        )
    else:
        message = (
            f"You will be eligible to donate blood again on {next_eligible.strftime('%d %b %Y')}. "
            "We'll remind you as it gets closer."
        )

    return create_notification(
        recipient=profile.user,
        title="Upcoming Donation Eligibility",
        message=message,
        notification_type="RETENTION",
        action_label="Find Nearby Camp",
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

    eligibility_reminder, reminder_created = generate_eligibility_reminder_for_donor(profile)

    if reminder_created and eligibility_reminder:
        created_notifications.append(eligibility_reminder)

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
    urgency_level="HIGH",
    units_needed=1,
    hospital_name="",
):
    alert = BloodDemandAlert.objects.create(
        blood_group=blood_group,
        title=title,
        message=message,
        urgency_level=urgency_level,
        units_needed=units_needed,
        hospital_name=hospital_name,
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

        hospital_note = f" at {hospital_name}" if hospital_name else ""
        notification_message = (
            f"[{urgency_level}] {message} UBTS currently needs {blood_group} blood donors"
            f"{hospital_note}. {units_needed} unit(s) required. "
            "Your donation may help save lives."
        )

        notification, created = create_notification(
            recipient=profile.user,
            title=title,
            message=notification_message,
            notification_type="BLOOD_DEMAND",
            action_label="View Alert",
            action_url="/blood-demand-alerts",
        )

        if created:
            created_notifications.append(notification)

    alert.notified_count = len(created_notifications)
    alert.save(update_fields=["notified_count"])

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


def _send_welcome_email(user, first_name):
    """Send a branded HTML welcome email with inline logo to a newly registered donor."""
    if not getattr(settings, "SEND_EMAIL_NOTIFICATIONS", False):
        return False
    if not user or not user.email:
        return False

    from django.core.mail import EmailMultiAlternatives
    from email.mime.image import MIMEImage
    from pathlib import Path

    subject = "Welcome to Red Hope — Thank You for Joining the Mission!"
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")

    # Try to load the logo for inline embedding
    logo_path = settings.BASE_DIR.parent / "frontend" / "src" / "assets" / "logo" / "redhope.png"
    logo_available = logo_path.exists()

    # Header block: logo image when available, text fallback otherwise
    if logo_available:
        logo_block = (
            '<img src="cid:redhope_logo" alt="Red Hope" '
            'style="height:80px;width:auto;display:block;margin:0 auto 10px;" />'
        )
    else:
        logo_block = (
            '<div style="font-size:30px;font-weight:900;color:#fff;letter-spacing:3px;">'
            'Red<span style="color:#ffaaaa;">&#9829;</span>Hope</div>'
        )

    plain_text = (
        f"Hi {first_name},\n\n"
        "Welcome to the Red Hope Blood Donor Programme!\n\n"
        "Thank you for deciding to join our mission of saving lives through voluntary "
        "blood donation. Your account is now active and ready.\n\n"
        "WHAT HAPPENS NEXT?\n"
        "  - Your Red Hope account is now active and ready.\n"
        "  - Our UBTS medical staff will review and add your medical information after your first donation.\n"
        "  - You will earn recognition badges and certificates as you continue donating.\n"
        "  - We will notify you of nearby blood donation camps and urgent blood requests.\n\n"
        "Find your nearest donation camp:\n"
        f"  {frontend_url}/donor-dashboard\n\n"
        "Once your medical record has been reviewed and completed by our UBTS staff, "
        "you will be fully activated as a donor in our system.\n\n"
        "Remember: Every drop counts. Every life matters.\n\n"
        "With gratitude,\n"
        "The Red Hope Team\n"
        "Uganda Blood Transfusion Services (UBTS)"
    )

    html_content = f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Welcome to Red Hope</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.1);max-width:600px;">

        <!-- ── Header with logo ── -->
        <tr>
          <td style="background:#8B0000;padding:32px 40px 24px;text-align:center;">
            {logo_block}
            <div style="font-size:11px;color:rgba(255,255,255,.7);margin-top:6px;letter-spacing:2px;text-transform:uppercase;">Every Drop Counts. Every Life Matters.</div>
          </td>
        </tr>

        <!-- ── Welcome banner ── -->
        <tr>
          <td style="background:#C0162C;padding:18px 40px;text-align:center;">
            <div style="font-size:20px;font-weight:700;color:#fff;">Welcome to the Family, {first_name}!</div>
            <div style="font-size:13px;color:rgba(255,255,255,.85);margin-top:5px;">You have just taken the first step toward saving lives.</div>
          </td>
        </tr>

        <!-- ── Body ── -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="font-size:15px;color:#374151;line-height:1.75;margin:0 0 16px;">Dear <strong>{first_name}</strong>,</p>
            <p style="font-size:15px;color:#374151;line-height:1.75;margin:0 0 16px;">
              Thank you for deciding to join <strong style="color:#C0162C;">Red Hope</strong> &mdash; Uganda&rsquo;s blood donor retention and recognition platform powered by the Uganda Blood Transfusion Services (UBTS).
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.75;margin:0 0 24px;">
              Your decision to become a blood donor is one of the most generous and life-changing acts a person can make. A single donation can save up to <strong>three lives</strong>.
            </p>

            <!-- What happens next box -->
            <div style="background:#FFF5F5;border-left:4px solid #C0162C;border-radius:4px;padding:20px 24px;margin-bottom:24px;">
              <div style="font-weight:800;color:#C0162C;font-size:13px;margin-bottom:12px;letter-spacing:.5px;">WHAT HAPPENS NEXT?</div>
              <div style="font-size:14px;color:#374151;line-height:2.1;">
                &#10003;&nbsp; Your Red Hope account is now <strong>active and ready</strong>.<br>
                &#10010;&nbsp; Our UBTS medical staff will review and add your medical information <strong>after your first donation</strong>.<br>
                &#127941;&nbsp; You will earn recognition badges and certificates as you continue donating.<br>
                &#128205;&nbsp; We will notify you of nearby blood donation camps and urgent blood requests.
              </div>
            </div>

            <p style="font-size:15px;color:#374151;line-height:1.75;margin:0 0 28px;">
              Once your medical record has been reviewed and completed by our UBTS staff, you will be fully activated as a donor and ready to save lives.
            </p>

            <!-- CTA buttons -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td style="padding-right:12px;">
                  <a href="{frontend_url}/donor-dashboard"
                     style="display:inline-block;background:#C0162C;color:#fff;text-decoration:none;padding:13px 26px;border-radius:6px;font-weight:700;font-size:14px;letter-spacing:.3px;">
                    View My Dashboard
                  </a>
                </td>
                <td>
                  <a href="{frontend_url}/donor-dashboard"
                     style="display:inline-block;background:#1B6CA8;color:#fff;text-decoration:none;padding:13px 26px;border-radius:6px;font-weight:700;font-size:14px;letter-spacing:.3px;">
                    &#128205; Find Nearest Donation Camp
                  </a>
                </td>
              </tr>
            </table>

            <p style="font-size:13px;color:#6B7280;line-height:1.7;margin:0;font-style:italic;text-align:center;">
              &ldquo;A single donation can save multiple lives. Thank you for choosing to make a difference.&rdquo;
            </p>
          </td>
        </tr>

        <!-- ── Footer ── -->
        <tr>
          <td style="background:#1B6CA8;padding:22px 40px;text-align:center;">
            <div style="font-size:13px;color:rgba(255,255,255,.95);font-weight:700;">The Red Hope Team</div>
            <div style="font-size:11px;color:rgba(255,255,255,.7);margin-top:4px;">Uganda Blood Transfusion Services (UBTS)</div>
            <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:8px;">Every Drop Counts. Every Life Matters.</div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        # multipart/related allows inline CID images alongside the HTML
        msg.mixed_subtype = "related"
        msg.attach_alternative(html_content, "text/html")

        if logo_available:
            with open(logo_path, "rb") as f:
                logo_mime = MIMEImage(f.read(), _subtype="png")
                logo_mime.add_header("Content-ID", "<redhope_logo>")
                logo_mime.add_header("Content-Disposition", "inline", filename="redhope.png")
                msg.attach(logo_mime)

        msg.send(fail_silently=True)
        return True
    except Exception as e:
        print("Welcome email failed:", e)
        return False


def send_welcome_notification(profile):
    """
    Send a welcome in-app notification, styled HTML email, and SMS
    to a donor immediately after their profile is created.
    """
    user = profile.user
    name_parts = (user.full_name or "").strip().split()
    first_name = name_parts[0] if name_parts else "Friend"

    title = "Welcome to Red Hope — Thank You for Joining!"
    in_app_message = (
        f"Hi {first_name}, welcome to Red Hope! Thank you for deciding to join our "
        "blood donation mission. Your account is now active. Our UBTS staff will add "
        "your medical information after your first donation. Every drop counts and "
        "every life matters — thank you for being a true hero!"
    )

    # In-app notification
    Notification.objects.create(
        recipient=user,
        title=title,
        message=in_app_message,
        notification_type="SYSTEM",
        action_label="View Dashboard",
        action_url="/donor-dashboard",
    )

    # Styled HTML welcome email
    _send_welcome_email(user=user, first_name=first_name)

    # SMS (only if phone number provided at registration)
    if profile.phone_number:
        sms_text = (
            f"Welcome to Red Hope, {first_name}! Thank you for joining our life-saving mission. "
            "Your account is now active. Medical info will be added by UBTS staff after your "
            "first donation. Every drop counts. Every life matters! - Red Hope"
        )
        send_sms_notification(phone_number=profile.phone_number, message=sms_text)