from datetime import date


def calculate_age(date_of_birth):
    if not date_of_birth:
        return None

    today = date.today()
    return (
        today.year
        - date_of_birth.year
        - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
    )


def check_donor_eligibility(profile, medical_record):
    reasons = []

    age = calculate_age(profile.date_of_birth)

    if age is not None and age < 17:
        reasons.append("Donor is below the minimum eligible age of 17 years.")

    if medical_record.weight_kg is not None and medical_record.weight_kg < 50:
        reasons.append("Donor weight is below the minimum requirement of 50 kg.")

    if medical_record.hemoglobin_level is not None and medical_record.hemoglobin_level < 12.5:
        reasons.append("Hemoglobin level is below the recommended minimum of 12.5 g/dL.")

    if medical_record.has_recent_illness:
        reasons.append("Donor has reported a recent illness.")

    if medical_record.has_chronic_condition:
        reasons.append("Donor has reported a chronic medical condition.")

    if medical_record.is_pregnant:
        reasons.append("Donor is currently pregnant.")

    if medical_record.is_on_medication:
        reasons.append("Donor is currently on medication and requires medical review.")

    if medical_record.last_donation_date:
        days_since_last_donation = (date.today() - medical_record.last_donation_date).days

        if days_since_last_donation < 90:
            reasons.append(
                f"Only {days_since_last_donation} days have passed since the last donation. "
                "At least 90 days are recommended."
            )

    is_eligible = len(reasons) == 0

    return {
        "is_eligible": is_eligible,
        "age": age,
        "reasons": reasons,
        "summary": (
            "Donor is currently eligible to donate blood."
            if is_eligible
            else "Donor is currently not eligible to donate blood."
        ),
    }