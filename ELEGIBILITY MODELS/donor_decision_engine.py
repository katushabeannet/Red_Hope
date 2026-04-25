import json
import joblib
import pandas as pd


def load_eligibility_rules(rules_path="eligibility_rules.json"):
    with open(rules_path, "r") as file:
        return json.load(file)


def load_availability_model(model_path="availability_logistic_model.pkl"):
    return joblib.load(model_path)


def detect_intent(user_query):
    query = user_query.lower()

    eligibility_keywords = [
        "eligible", "can i donate", "allowed to donate",
        "hemoglobin", "weight", "medical condition",
        "sick", "illness", "condition"
    ]

    availability_keywords = [
        "available", "likely to donate", "donate again",
        "return", "campaign", "invite", "reminder"
    ]

    if any(word in query for word in eligibility_keywords) and any(word in query for word in availability_keywords):
        return "combined"

    if any(word in query for word in eligibility_keywords):
        return "eligibility"

    if any(word in query for word in availability_keywords):
        return "availability"

    return "general_qa"


def eligibility_engine(donor, rules):
    condition = donor.get("medical_condition", "None")
    weight = donor.get("weight_kg")
    hemoglobin = donor.get("hemoglobin_g_dl")

    if condition in rules["disallowed_conditions"]:
        return {
            "eligible": False,
            "reason": f"Medical condition '{condition}' prevents donation.",
            "decision": "Not Eligible"
        }

    if weight is not None and weight < rules["min_weight_kg"]:
        return {
            "eligible": False,
            "reason": f"Weight below minimum requirement ({rules['min_weight_kg']} kg).",
            "decision": "Not Eligible"
        }

    if hemoglobin is not None and hemoglobin < rules["min_hemoglobin_g_dl"]:
        return {
            "eligible": False,
            "reason": f"Hemoglobin below minimum requirement ({rules['min_hemoglobin_g_dl']} g/dL).",
            "decision": "Not Eligible"
        }

    return {
        "eligible": True,
        "reason": "Donor satisfies eligibility requirements.",
        "decision": "Eligible"
    }


def availability_engine(donor, availability_model):
    features = pd.DataFrame([{
        "Recency": donor.get("recency"),
        "Frequency": donor.get("frequency"),
        "Time": donor.get("time")
    }])

    probability = availability_model.predict_proba(features)[0][1]
    prediction = availability_model.predict(features)[0]

    return {
        "available": bool(prediction == 1),
        "probability": round(probability, 4),
        "decision": "Likely Available" if prediction == 1 else "Not Likely Available"
    }


def combined_decision(eligibility_result, availability_result):
    eligible = eligibility_result["eligible"]
    available = availability_result["available"]

    if eligible and available:
        action = "Invite donor for the next campaign."
    elif eligible and not available:
        action = "Send soft reminder or awareness message."
    elif not eligible and available:
        action = "Do not invite yet. Provide medical guidance first."
    else:
        action = "Low priority for campaign invitation."

    return {
        "eligibility": eligibility_result["decision"],
        "availability": availability_result["decision"],
        "availability_probability": availability_result["probability"],
        "reason": eligibility_result["reason"],
        "recommended_action": action
    }


def format_response(result):
    return f"""
Eligibility Status: {result['eligibility']}
Availability Status: {result['availability']}
Availability Probability: {result['availability_probability']}

Reason:
{result['reason']}

Recommended Action:
{result['recommended_action']}
"""