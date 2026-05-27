def predict_donor_availability(profile, medical_record):
    """
    Temporary rule-based fallback for sample UBTS system.
    Later, this will load availability_model.pkl.
    """

    score = 0.75
    reasons = []

    if medical_record.has_recent_illness:
        score -= 0.25
        reasons.append("Recent illness may reduce donor availability.")

    if medical_record.has_chronic_condition:
        score -= 0.25
        reasons.append("Chronic condition may reduce donor availability.")

    if medical_record.is_on_medication:
        score -= 0.15
        reasons.append("Medication status may require review.")

    if medical_record.last_donation_date:
        score += 0.10
        reasons.append("Donor has previous donation history.")

    score = max(0, min(score, 1))

    is_available = score >= 0.60

    return {
        "is_available": is_available,
        "availability_probability": round(score, 2),
        "reasons": reasons,
        "summary": (
            "Donor is likely available for donation."
            if is_available
            else "Donor may not currently be available for donation."
        ),
    }