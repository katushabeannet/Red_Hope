from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from ai_modules.mpnet_retriever import retrieve_blood_donation_answer
from ai_modules.gpt_response_generator import format_verified_response


@api_view(["POST"])
@permission_classes([AllowAny])
def chatbot_router_view(request):
    query = request.data.get("query", "").strip()

    if not query:
        return Response(
            {"error": "Query is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = request.user if request.user.is_authenticated else None
    role = getattr(user, "role", "GUEST") if user else "GUEST"

    query_lower = query.lower()

    if role == "ADMIN":
        if "campaign" in query_lower or "ready donors" in query_lower:
            return Response(
                {
                    "intent": "admin_campaign_scan",
                    "role": role,
                    "message": (
                        "Admin campaign scans should be performed from the admin dashboard "
                        "using the campaign-ready donor scan API."
                    ),
                }
            )

        retriever_result = retrieve_blood_donation_answer(query)

        return Response(
            {
                "intent": "admin_general_question",
                "role": role,
                "retriever_result": retriever_result,
                "assistant_response": retriever_result["answer"],
            }
        )

    if role == "DONOR":
        if "eligible" in query_lower or "eligibility" in query_lower:
            return Response(
                {
                    "intent": "donor_eligibility",
                    "role": role,
                    "message": (
                        "Please use the donor eligibility-check endpoint so the system can "
                        "evaluate your saved medical profile safely."
                    ),
                }
            )

        if "available" in query_lower or "availability" in query_lower:
            return Response(
                {
                    "intent": "donor_availability",
                    "role": role,
                    "message": (
                        "Please use the donor availability-check endpoint so the system can "
                        "use your verified donor record."
                    ),
                }
            )

        if "where" in query_lower or "nearest" in query_lower or "camp" in query_lower:
            return Response(
                {
                    "intent": "nearest_camp",
                    "role": role,
                    "message": (
                        "Please share your location so the system can recommend the nearest "
                        "active donation camp."
                    ),
                }
            )

        retriever_result = retrieve_blood_donation_answer(query)

        return Response(
            {
                "intent": "general_donor_question",
                "role": role,
                "retriever_result": retriever_result,
                "assistant_response": retriever_result["answer"],
            }
        )

    if "where" in query_lower or "nearest" in query_lower or "camp" in query_lower:
        return Response(
            {
                "intent": "guest_nearest_camp",
                "role": "GUEST",
                "message": (
                    "Please allow location access so the system can recommend the nearest "
                    "active donation camp."
                ),
            }
        )

    retriever_result = retrieve_blood_donation_answer(query)

    return Response(
        {
            "intent": "guest_general_question",
            "role": "GUEST",
            "retriever_result": retriever_result,
            "assistant_response": retriever_result["answer"],
        }
    )