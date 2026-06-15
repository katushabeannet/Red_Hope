import os
from datetime import date

import joblib
import pandas as pd
from django.conf import settings


MODEL_PATH = os.path.join(
    settings.BASE_DIR,
    "ai_modules",
    "availability",
    "availability_logistic_model_retrained.pkl",
)

AVAILABILITY_THRESHOLD = 0.50

_model = None


def load_availability_model():
    global _model

    if _model is None:
        _model = joblib.load(MODEL_PATH)

    return _model


def calculate_days_since_last_donation(medical_record):
    if not medical_record or not medical_record.last_donation_date:
        return 999

    return (date.today() - medical_record.last_donation_date).days


def estimate_months_since_first_donation(profile, medical_record):
    total_donations = getattr(profile, "total_donations", 0) or 0

    if total_donations <= 0:
        return 0

    if medical_record and medical_record.last_donation_date:
        days_since_last_donation = calculate_days_since_last_donation(
            medical_record
        )

        estimated_months = int((days_since_last_donation / 30) + total_donations)

        return max(estimated_months, total_donations)

    return total_donations


def build_feature_frame(profile, medical_record):
    days_since_last_donation = calculate_days_since_last_donation(medical_record)
    total_donations = getattr(profile, "total_donations", 0) or 0
    months_since_first_donation = estimate_months_since_first_donation(
        profile,
        medical_record,
    )

    return pd.DataFrame(
        [
            {
                "days_since_last_donation": days_since_last_donation,
                "total_donations": total_donations,
                "months_since_first_donation": months_since_first_donation,
            }
        ],
        columns=[
            "days_since_last_donation",
            "total_donations",
            "months_since_first_donation",
        ],
    )


def classify_availability_tier(probability):
    if probability >= 0.80:
        return "HIGH"

    if probability >= AVAILABILITY_THRESHOLD:
        return "MEDIUM"

    return "LOW"


def predict_availability(profile, medical_record):
    model = load_availability_model()
    features = build_feature_frame(profile, medical_record)

    if hasattr(model, "predict_proba"):
        probability = float(model.predict_proba(features)[0][1])
    else:
        prediction = int(model.predict(features)[0])
        probability = 1.0 if prediction == 1 else 0.0

    is_available = probability >= AVAILABILITY_THRESHOLD
    availability_tier = classify_availability_tier(probability)

    days_since_last_donation = int(features.iloc[0]["days_since_last_donation"])
    total_donations = int(features.iloc[0]["total_donations"])
    months_since_first_donation = int(
        features.iloc[0]["months_since_first_donation"]
    )

    reasons = [
        f"Days since last donation: {days_since_last_donation}.",
        f"Recorded total donations: {total_donations}.",
        f"Estimated months since first donation: {months_since_first_donation}.",
        f"Availability probability: {round(probability * 100)}%.",
    ]

    if availability_tier == "HIGH":
        summary = (
            "The donor has a high predicted likelihood of responding to a "
            "donation campaign."
        )
        reasons.append(
            "The donor is classified as high-priority for campaign targeting."
        )

    elif availability_tier == "MEDIUM":
        summary = (
            "The donor has a moderate predicted likelihood of responding to a "
            "donation campaign."
        )
        reasons.append(
            "The donor is classified as medium-priority for campaign targeting."
        )

    else:
        summary = (
            "The donor has a low predicted likelihood of responding to a "
            "donation campaign."
        )
        reasons.append(
            "The donor can still be considered for retention campaigns, but "
            "should be ranked below donors with higher predicted availability."
        )

    return {
        "is_available": is_available,
        "availability_probability": round(probability, 4),
        "availability_tier": availability_tier,
        "summary": summary,
        "reasons": reasons,
        "features": features.iloc[0].to_dict(),
    }


def predict_donor_availability(profile, medical_record):
    return predict_availability(profile, medical_record)