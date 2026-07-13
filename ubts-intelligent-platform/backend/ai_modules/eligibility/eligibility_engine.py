import json
import os
from datetime import date

from django.conf import settings


RULES_PATH = os.path.join(
    settings.BASE_DIR,
    "ai_modules",
    "eligibility",
    "eligibility_rules.json",
)

MIN_DONATION_INTERVAL_DAYS = 90


def load_eligibility_rules():
    with open(RULES_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def calculate_age(date_of_birth):
    if not date_of_birth:
        return None

    today = date.today()

    return (
        today.year
        - date_of_birth.year
        - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
    )


def calculate_days_since_last_donation(last_donation_date):
    if not last_donation_date:
        return None

    return (date.today() - last_donation_date).days


def run_eligibility_rules(profile, medical_record):
    rules = load_eligibility_rules()

    reasons = []
    is_eligible = True

    min_age = rules.get("min_age", 17)
    max_age = rules.get("max_age", 65)
    min_weight = rules.get("min_weight_kg", 50)
    min_hemoglobin = rules.get("min_hemoglobin_g_dl", 12.5)
    min_donation_interval_days = rules.get(
        "min_donation_interval_days", MIN_DONATION_INTERVAL_DAYS
    )
    disallowed_conditions = rules.get("disallowed_conditions", [])

    age = calculate_age(profile.date_of_birth)

    if not medical_record:
        return {
            "is_eligible": False,
            "age": age,
            "summary": "Eligibility cannot be confirmed because UBTS medical screening information is missing.",
            "reasons": [
                "Medical record is missing.",
                "UBTS staff must record weight and hemoglobin level first.",
            ],
        }

    if age is None:
        is_eligible = False
        reasons.append("Date of birth is missing, so age cannot be verified.")
    elif age < min_age:
        is_eligible = False
        reasons.append(f"Donor must be at least {min_age} years old.")
    elif age > max_age:
        is_eligible = False
        reasons.append(f"Donor age must not exceed {max_age} years.")

    if medical_record.weight_kg is None or medical_record.weight_kg < min_weight:
        is_eligible = False
        reasons.append(f"Weight must be at least {min_weight} kg.")

    if (
        medical_record.hemoglobin_level is None
        or medical_record.hemoglobin_level < min_hemoglobin
    ):
        is_eligible = False
        reasons.append(f"Hemoglobin level must be at least {min_hemoglobin} g/dL.")

    days_since_last_donation = calculate_days_since_last_donation(
        medical_record.last_donation_date
    )

    if days_since_last_donation is not None:
        if days_since_last_donation < min_donation_interval_days:
            remaining_days = min_donation_interval_days - days_since_last_donation
            is_eligible = False
            reasons.append(
                f"Only {days_since_last_donation} day(s) have passed since the last donation. "
                f"The donor should wait about {remaining_days} more day(s) before donating again."
            )

    medical_condition = getattr(medical_record, "medical_condition", "None") or "None"
    if medical_condition in disallowed_conditions:
        is_eligible = False
        reasons.append(
            f"Medical condition '{medical_condition}' currently prevents blood donation."
        )

    if getattr(medical_record, "has_recent_illness", False):
        is_eligible = False
        reasons.append("Recent illness may temporarily prevent donation.")

    if getattr(medical_record, "has_chronic_condition", False):
        is_eligible = False
        reasons.append("A chronic condition requires UBTS medical review.")

    if getattr(medical_record, "is_pregnant", False):
        is_eligible = False
        reasons.append("Pregnancy temporarily prevents blood donation.")

    if getattr(medical_record, "is_on_medication", False):
        is_eligible = False
        reasons.append("Medication status should be reviewed by UBTS staff before donation.")

    if is_eligible:
        summary = "You appear eligible to donate blood based on the UBTS rules available in the system."
        reasons.append(
            "Age, weight, hemoglobin level, health status, and donation interval meet the minimum requirements."
        )
    else:
        summary = "You are currently not confirmed eligible to donate blood."

    return {
        "is_eligible": is_eligible,
        "age": age,
        "summary": summary,
        "reasons": reasons,
    }


def check_donor_eligibility(profile, medical_record):
    return run_eligibility_rules(profile, medical_record)