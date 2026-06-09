import json
import os
from django.conf import settings


RULES_PATH = os.path.join(
    settings.BASE_DIR,
    "ai_modules",
    "eligibility",
    "eligibility_rules.json",
)


def load_eligibility_rules():
    with open(RULES_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def run_eligibility_rules(profile, medical_record):
    rules = load_eligibility_rules()

    reasons = []
    is_eligible = True

    min_weight = rules.get("min_weight_kg", 50)
    min_hemoglobin = rules.get("min_hemoglobin_g_dl", 12.5)

    if not medical_record:
        return {
            "is_eligible": False,
            "summary": (
                "Your eligibility cannot be confirmed yet because UBTS has not "
                "recorded your medical screening information."
            ),
            "reasons": [
                "Medical record is missing.",
                "UBTS staff must record your weight and hemoglobin level first.",
            ],
        }

    if medical_record.weight_kg is None or medical_record.weight_kg < min_weight:
        is_eligible = False
        reasons.append(f"Weight must be at least {min_weight} kg.")

    if (
        medical_record.hemoglobin_level is None
        or medical_record.hemoglobin_level < min_hemoglobin
    ):
        is_eligible = False
        reasons.append(
            f"Hemoglobin level must be at least {min_hemoglobin} g/dL."
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
        reasons.append(
            "Medication status should be reviewed by UBTS staff before donation."
        )

    if is_eligible:
        summary = "You appear eligible to donate blood based on the UBTS rules available in the system."
        reasons.append("Your recorded weight and hemoglobin level meet the minimum requirements.")
    else:
        summary = "You are currently not confirmed eligible to donate blood."

    return {
        "is_eligible": is_eligible,
        "summary": summary,
        "reasons": reasons,
    }