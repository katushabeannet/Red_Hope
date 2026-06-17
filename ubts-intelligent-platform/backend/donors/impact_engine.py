from donors.models import DonorBadge


BADGE_THRESHOLDS = [
    (1, "First Life Saver", "Awarded for completing your first blood donation"),
    (5, "Regular Donor", "Awarded for completing 5 blood donations"),
    (10, "Community Hero", "Awarded for completing 10 blood donations"),
    (20, "Gold Donor", "Awarded for completing 20 blood donations"),
]


def determine_next_badge(total_donations):
    for threshold, name, description in BADGE_THRESHOLDS:
        if total_donations < threshold:
            return {
                "threshold": threshold,
                "name": name,
                "description": description,
                "remaining": threshold - total_donations,
            }
    return None


def determine_donor_level(total_donations):
    if total_donations >= 20:
        return "Platinum"
    if total_donations >= 10:
        return "Gold"
    if total_donations >= 5:
        return "Silver"
    return "Bronze"


def determine_next_milestone(total_donations):
    if total_donations < 5:
        return 5
    if total_donations < 10:
        return 10
    if total_donations < 20:
        return 20
    return None


def calculate_lives_saved(total_donations):
    return total_donations * 3


def get_total_donations(profile):
    return getattr(profile, "total_donations", 0) or 0


def get_donor_impact_summary(profile):
    total_donations = get_total_donations(profile)
    donor_level = determine_donor_level(total_donations)
    lives_saved = calculate_lives_saved(total_donations)
    next_milestone = determine_next_milestone(total_donations)

    badges = DonorBadge.objects.filter(donor=profile).values(
        "badge_name",
        "badge_description",
    )

    next_badge = determine_next_badge(total_donations)

    return {
        "total_donations": total_donations,
        "estimated_lives_saved": lives_saved,
        "donor_level": donor_level,
        "next_milestone": next_milestone,
        "next_badge": next_badge,
        "badges": list(badges),
    }