import os
from datetime import date

import joblib
import numpy as np
from django.conf import settings


MODEL_PATH = os.path.join(
    settings.BASE_DIR,
    "ai_modules",
    "availability",
    "availability_logistic_model.pkl",
)

_model = None


def load_availability_model():
    global _model

    if _model is None:
        _model = joblib.load(MODEL_PATH)

    return _model


def calculate_recency_days(medical_record):
    if not medical_record or not medical_record.last_donation_date:
        return 999

    return (date.today() - medical_record.last_donation_date).days


def predict_availability(profile, medical_record):
    model = load_availability_model()

    recency = calculate_recency_days(medical_record)

    frequency = getattr(profile, "donation_frequency", 0) or 0
    time = getattr(profile, "donor_history_months", 0) or 0

    features = np.array([[recency, frequency, time]])

    prediction = int(model.predict(features)[0])

    probability = None
    if hasattr(model, "predict_proba"):
        probability = float(model.predict_proba(features)[0][1])

    is_available = prediction == 1

    if is_available:
        summary = "The availability model predicts that this donor is likely available to donate again."
    else:
        summary = "The availability model predicts that this donor may not currently be available to donate again."

    return {
        "is_available": is_available,
        "availability_probability": round(probability, 4) if probability is not None else None,
        "summary": summary,
        "features": {
            "Recency": recency,
            "Frequency": frequency,
            "Time": time,
        },
    }