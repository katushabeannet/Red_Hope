from donors.models import DonorBadge


BADGES = {
    1: (
        "First Life Saver",
        "Completed first blood donation",
    ),
    5: (
        "Regular Donor",
        "Completed 5 donations",
    ),
    10: (
        "Community Hero",
        "Completed 10 donations",
    ),
    20: (
        "Gold Donor",
        "Completed 20 donations",
    ),
}


def award_badges(profile):
    total_donations = profile.total_donations

    if total_donations not in BADGES:
        return

    badge_name, description = BADGES[total_donations]

    exists = DonorBadge.objects.filter(
        donor=profile,
        badge_name=badge_name,
    ).exists()

    if not exists:
        DonorBadge.objects.create(
            donor=profile,
            badge_name=badge_name,
            badge_description=description,
        )