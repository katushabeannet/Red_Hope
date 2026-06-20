from ai_modules.router.intent_detector import detect_intent
from ai_modules.conversational.mpnet_retriever import retrieve_blood_donation_answer
from ai_modules.eligibility.eligibility_engine import run_eligibility_rules
from ai_modules.availability.availability_engine import predict_availability
from ai_modules.gpt_response_generator import (
    format_availability_response,
    format_combined_response,
    format_conversational_response,
    format_eligibility_response,
    format_safe_decline_response,
)


LOW_CONFIDENCE_VALUES = ["Low"]


def get_donor_profile_and_medical_record(user):
    profile = getattr(user, "donor_profile", None)

    if not profile:
      return None, None

    medical_record = getattr(profile, "medical_record", None)

    return profile, medical_record


def get_support_contact(role):
    if role == "DONOR":
        return {
            "name": "UBTS Medical Support",
            "role": "Medical Officer",
            "phone_number": "+256700000000",
            "whatsapp_url": "https://wa.me/256700000000",
        }

    return {
        "name": "UBTS General Support",
        "role": "Blood Donation Support",
        "phone_number": "+256700000000",
        "whatsapp_url": "https://wa.me/256700000000",
    }


def with_fallback(gpt_text, fallback_text):
    return gpt_text if gpt_text else fallback_text


def route_chatbot_query(query, user=None, conversation_history=None):
    role = (
        getattr(user, "role", "GUEST")
        if user and user.is_authenticated
        else "GUEST"
    )

    intent = detect_intent(query)

    if intent == "GEOSPATIAL":
        return {
            "intent": "geospatial_mode",
            "mode": "GEOSPATIAL",
            "role": role,
            "action_required": True,
            "action_type": "REQUEST_LOCATION",
            "api_endpoint": "/api/camps/nearest/",
            "method": "POST",
            "required_payload": ["latitude", "longitude"],
            "assistant_response": (
                "Please allow location access so I can recommend the nearest "
                "active blood donation camp."
            ),
        }

    if intent == "ELIGIBILITY":
        if role != "DONOR":
            fallback = (
                "Eligibility checks require a registered donor account and UBTS "
                "medical screening data. Please log in as a donor to check your "
                "personal eligibility."
            )

            gpt_text = format_safe_decline_response(query, role)

            return {
                "intent": "eligibility_mode_guest",
                "mode": "SAFE_DECLINE",
                "role": role,
                "action_required": False,
                "assistant_response": with_fallback(gpt_text, fallback),
                "support_contact": get_support_contact(role),
            }

        profile, medical_record = get_donor_profile_and_medical_record(user)
        result = run_eligibility_rules(profile, medical_record)

        fallback = result["summary"]
        gpt_text = format_eligibility_response(query, result)

        return {
            "intent": "eligibility_mode",
            "mode": "ELIGIBILITY",
            "role": role,
            "action_required": False,
            "eligibility_result": result,
            "assistant_response": with_fallback(gpt_text, fallback),
        }

    if intent == "AVAILABILITY":
        if role != "DONOR":
            fallback = (
                "Availability prediction requires a registered donor account "
                "and donor history. Please log in as a donor to check your "
                "availability."
            )

            gpt_text = format_safe_decline_response(query, role)

            return {
                "intent": "availability_mode_guest",
                "mode": "SAFE_DECLINE",
                "role": role,
                "action_required": False,
                "assistant_response": with_fallback(gpt_text, fallback),
                "support_contact": get_support_contact(role),
            }

        profile, medical_record = get_donor_profile_and_medical_record(user)
        result = predict_availability(profile, medical_record)

        fallback = result["summary"]
        gpt_text = format_availability_response(query, result)

        return {
            "intent": "availability_mode",
            "mode": "AVAILABILITY",
            "role": role,
            "action_required": False,
            "availability_result": result,
            "assistant_response": with_fallback(gpt_text, fallback),
        }

    if intent == "COMBINED":
        if role != "DONOR":
            fallback = (
                "A full donor readiness check requires a registered donor account. "
                "Please log in as a donor to check eligibility and availability."
            )

            gpt_text = format_safe_decline_response(query, role)

            return {
                "intent": "combined_mode_guest",
                "mode": "SAFE_DECLINE",
                "role": role,
                "action_required": False,
                "assistant_response": with_fallback(gpt_text, fallback),
                "support_contact": get_support_contact(role),
            }

        profile, medical_record = get_donor_profile_and_medical_record(user)

        eligibility = run_eligibility_rules(profile, medical_record)
        availability = predict_availability(profile, medical_record)

        ready = eligibility["is_eligible"] and availability["is_available"]

        fallback = (
            "You appear ready to donate based on eligibility rules and the "
            "availability model."
            if ready
            else "You are not fully ready to donate yet based on the current "
            "eligibility and availability checks."
        )

        gpt_text = format_combined_response(
            query,
            eligibility,
            availability,
            ready,
        )

        return {
            "intent": "combined_mode",
            "mode": "COMBINED",
            "role": role,
            "action_required": False,
            "eligibility_result": eligibility,
            "availability_result": availability,
            "is_campaign_ready": ready,
            "assistant_response": with_fallback(gpt_text, fallback),
        }

    try:
        retriever_result = retrieve_blood_donation_answer(query)
    except Exception as retriever_error:
        print("MPNET retriever failed:", retriever_error)
        return {
            "intent": "retriever_fallback",
            "mode": "CONVERSATIONAL",
            "role": role,
            "action_required": False,
            "assistant_response": (
                "I'm having trouble accessing my knowledge base right now. "
                "For blood donation questions, please visit ubts.go.ug or contact "
                "UBTS on +256 414 347 980. I apologize for the inconvenience."
            ),
        }

    if (
        retriever_result.get("confidence") in LOW_CONFIDENCE_VALUES
        and not retriever_result.get("blood_domain", False)
    ):
        fallback = (
            "I can only answer questions related to blood donation, donor "
            "eligibility, donation availability, and donation camps. For medical "
            "questions outside this scope, please contact UBTS medical staff."
        )

        gpt_text = format_safe_decline_response(query, role)

        return {
            "intent": "safe_decline_low_confidence",
            "mode": "SAFE_DECLINE",
            "role": role,
            "action_required": False,
            "retriever_result": retriever_result,
            "assistant_response": with_fallback(gpt_text, fallback),
            "support_contact": get_support_contact(role),
        }

    fallback = retriever_result["answer"]
    gpt_text = format_conversational_response(query, retriever_result, history=conversation_history)

    return {
        "intent": "conversational_mode",
        "mode": "CONVERSATIONAL",
        "role": role,
        "action_required": False,
        "retriever_result": retriever_result,
        "assistant_response": with_fallback(gpt_text, fallback),
    }