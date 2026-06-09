from donors.models import DonorBadge


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

    return {
        "total_donations": total_donations,
        "estimated_lives_saved": lives_saved,
        "donor_level": donor_level,
        "next_milestone": next_milestone,
        "badges": list(badges),
    }