from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from ai_modules.mpnet_retriever import retrieve_blood_donation_answer
from neo4j_service.neo4j_client import Neo4jClient


def save_chatbot_trace(user_identifier, user_type, query, retriever_result):
    try:
        neo4j_client = Neo4jClient()

        neo4j_client.create_chatbot_trace(
            user_identifier=user_identifier,
            user_type=user_type,
            user_query=query,
            matched_question=retriever_result["matched_question"],
            answer=retriever_result["answer"],
            similarity_score=retriever_result["similarity_score"],
            confidence=retriever_result["confidence"],
        )

        neo4j_client.close()

    except Exception as e:
        print("Neo4j chatbot trace failed:", e)


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

    # ADMIN WORKFLOWS
    if role == "ADMIN":
        if (
            "campaign" in query_lower
            or "ready donors" in query_lower
            or "scan donors" in query_lower
        ):
            return Response(
                {
                    "intent": "admin_campaign_ready_scan",
                    "role": role,
                    "action_required": True,
                    "action_type": "CALL_API",
                    "api_endpoint": "/api/donors/admin/campaign-ready/",
                    "method": "GET",
                    "assistant_response": (
                        "I can help you scan for campaign-ready donors. "
                        "Use the admin campaign-ready donor scan to retrieve eligible "
                        "and likely available donors."
                    ),
                }
            )

        retriever_result = retrieve_blood_donation_answer(query)

        save_chatbot_trace(
            user_identifier=user.email,
            user_type="ADMIN",
            query=query,
            retriever_result=retriever_result,
        )

        return Response(
            {
                "intent": "admin_general_question",
                "role": role,
                "action_required": False,
                "retriever_result": retriever_result,
                "assistant_response": retriever_result["answer"],
            }
        )

    # DONOR WORKFLOWS
    if role == "DONOR":
        if "eligible" in query_lower or "eligibility" in query_lower:
            return Response(
                {
                    "intent": "donor_eligibility_check",
                    "role": role,
                    "action_required": True,
                    "action_type": "CALL_API",
                    "api_endpoint": "/api/donors/eligibility-check/",
                    "method": "POST",
                    "assistant_response": (
                        "I can check your blood donation eligibility using your saved "
                        "donor profile and medical record."
                    ),
                }
            )

        if "available" in query_lower or "availability" in query_lower:
            return Response(
                {
                    "intent": "donor_availability_check",
                    "role": role,
                    "action_required": True,
                    "action_type": "CALL_API",
                    "api_endpoint": "/api/donors/availability-check/",
                    "method": "POST",
                    "assistant_response": (
                        "I can estimate your donation availability using your verified "
                        "donor information."
                    ),
                }
            )

        if (
            "where" in query_lower
            or "nearest" in query_lower
            or "camp" in query_lower
            or "location" in query_lower
        ):
            return Response(
                {
                    "intent": "donor_nearest_camp",
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
            )

        retriever_result = retrieve_blood_donation_answer(query)

        save_chatbot_trace(
            user_identifier=user.email,
            user_type="DONOR",
            query=query,
            retriever_result=retriever_result,
        )

        return Response(
            {
                "intent": "donor_general_question",
                "role": role,
                "action_required": False,
                "retriever_result": retriever_result,
                "assistant_response": retriever_result["answer"],
            }
        )

    # GUEST WORKFLOWS
    if (
        "where" in query_lower
        or "nearest" in query_lower
        or "camp" in query_lower
        or "location" in query_lower
    ):
        return Response(
            {
                "intent": "guest_nearest_camp",
                "role": "GUEST",
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
        )

    retriever_result = retrieve_blood_donation_answer(query)

    save_chatbot_trace(
        user_identifier="guest-user",
        user_type="GUEST",
        query=query,
        retriever_result=retriever_result,
    )

    return Response(
        {
            "intent": "guest_general_question",
            "role": "GUEST",
            "action_required": False,
            "retriever_result": retriever_result,
            "assistant_response": retriever_result["answer"],
        }
    )