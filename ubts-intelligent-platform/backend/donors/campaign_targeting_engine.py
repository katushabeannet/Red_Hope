import math

from ai_modules.eligibility.eligibility_engine import run_eligibility_rules
from ai_modules.availability.availability_engine import predict_availability
from donors.models import DonorProfile, DonorMedicalRecord


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


def get_profile_coordinate(profile, field_name):
    value = getattr(profile, field_name, None)

    if value in [None, ""]:
        return None

    return float(value)


def normalize_blood_group(value):
    if not value:
        return None

    return str(value).strip().upper().replace(" ", "")


def calculate_campaign_priority(availability_probability, distance_km):
    probability_score = availability_probability or 0

    if distance_km is None:
        distance_score = 0.5
    else:
        distance_score = max(0, 1 - (distance_km / 50))

    final_score = (probability_score * 0.75) + (distance_score * 0.25)

    return round(final_score, 4)


def build_donor_payload(
    profile,
    eligibility,
    availability,
    distance_km=None,
    match_status="MATCHED",
    exclusion_reason=None,
):
    availability_probability = availability.get("availability_probability") or 0
    priority_score = calculate_campaign_priority(
        availability_probability,
        distance_km,
    )

    return {
        "donor_id": profile.id,
        "full_name": profile.user.full_name,
        "email": profile.user.email,
        "phone_number": profile.phone_number,
        "blood_group": profile.blood_group,
        "address": profile.address,
        "latitude": profile.latitude,
        "longitude": profile.longitude,
        "total_donations": getattr(profile, "total_donations", 0) or 0,
        "distance_km": distance_km,
        "is_eligible": eligibility.get("is_eligible"),
        "is_available": availability.get("is_available"),
        "availability_tier": availability.get("availability_tier"),
        "campaign_priority_score": priority_score,
        "eligibility_summary": eligibility.get("summary"),
        "eligibility_reasons": eligibility.get("reasons", []),
        "availability_summary": availability.get("summary"),
        "availability_reasons": availability.get("reasons", []),
        "availability_probability": availability.get("availability_probability"),
        "match_status": match_status,
        "exclusion_reason": exclusion_reason,
    }


def scan_personalized_campaign_donors(
    blood_group=None,
    campaign_latitude=None,
    campaign_longitude=None,
    radius_km=10,
):
    matched_donors = []
    ineligible_donors = []
    outside_radius_donors = []
    skipped_donors = []

    requested_blood_group = normalize_blood_group(blood_group)

    donors = DonorProfile.objects.select_related("user").all()

    for profile in donors:
        try:
            medical_record = profile.medical_record
        except DonorMedicalRecord.DoesNotExist:
            skipped_donors.append(
                {
                    "donor_id": profile.id,
                    "full_name": profile.user.full_name,
                    "reason": "Missing medical record",
                }
            )
            continue

        profile_blood_group = normalize_blood_group(profile.blood_group)

        if requested_blood_group and profile_blood_group != requested_blood_group:
            continue

        donor_latitude = get_profile_coordinate(profile, "latitude")
        donor_longitude = get_profile_coordinate(profile, "longitude")

        distance_km = None

        if campaign_latitude and campaign_longitude:
            if donor_latitude is None or donor_longitude is None:
                skipped_donors.append(
                    {
                        "donor_id": profile.id,
                        "full_name": profile.user.full_name,
                        "reason": "Missing donor coordinates",
                    }
                )
                continue

            distance_km = haversine_distance_km(
                campaign_latitude,
                campaign_longitude,
                donor_latitude,
                donor_longitude,
            )

            if distance_km > float(radius_km):
                eligibility = run_eligibility_rules(profile, medical_record)
                availability = predict_availability(profile, medical_record)

                outside_radius_donors.append(
                    build_donor_payload(
                        profile,
                        eligibility,
                        availability,
                        distance_km=distance_km,
                        match_status="OUTSIDE_RADIUS",
                        exclusion_reason=(
                            f"Donor is {distance_km} km away, outside the "
                            f"{radius_km} km radius."
                        ),
                    )
                )
                continue

        eligibility = run_eligibility_rules(profile, medical_record)
        availability = predict_availability(profile, medical_record)

        if not eligibility.get("is_eligible"):
            ineligible_donors.append(
                build_donor_payload(
                    profile,
                    eligibility,
                    availability,
                    distance_km=distance_km,
                    match_status="INELIGIBLE",
                    exclusion_reason="Donor is not eligible based on UBTS rules.",
                )
            )
            continue

        matched_donors.append(
            build_donor_payload(
                profile,
                eligibility,
                availability,
                distance_km=distance_km,
                match_status="MATCHED",
            )
        )

    matched_donors = sorted(
        matched_donors,
        key=lambda donor: (
            donor.get("campaign_priority_score", 0),
            donor.get("availability_probability", 0),
            -1 * (donor.get("distance_km") or 9999),
        ),
        reverse=True,
    )

    high_priority = [
        donor for donor in matched_donors if donor.get("availability_tier") == "HIGH"
    ]

    medium_priority = [
        donor for donor in matched_donors if donor.get("availability_tier") == "MEDIUM"
    ]

    low_priority = [
        donor for donor in matched_donors if donor.get("availability_tier") == "LOW"
    ]

    return {
        "total_matches": len(matched_donors),
        "matched_donors": matched_donors,
        "high_priority_donors": high_priority,
        "medium_priority_donors": medium_priority,
        "low_priority_donors": low_priority,
        "ineligible_donors": ineligible_donors,
        "outside_radius_donors": outside_radius_donors,
        "skipped_donors": skipped_donors,
        "summary": {
            "matched": len(matched_donors),
            "high_priority": len(high_priority),
            "medium_priority": len(medium_priority),
            "low_priority": len(low_priority),
            "ineligible": len(ineligible_donors),
            "outside_radius": len(outside_radius_donors),
            "skipped": len(skipped_donors),
        },
        "filters": {
            "blood_group": blood_group,
            "campaign_latitude": campaign_latitude,
            "campaign_longitude": campaign_longitude,
            "radius_km": radius_km,
        },
    }