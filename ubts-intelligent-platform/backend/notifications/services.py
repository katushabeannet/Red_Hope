from donors.retention_engine import get_donor_retention_summary
from donors.impact_engine import get_donor_impact_summary

from .models import Notification


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
        target_role="DONOR",
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
        target_role="DONOR",
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