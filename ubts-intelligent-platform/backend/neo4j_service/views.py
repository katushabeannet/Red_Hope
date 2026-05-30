from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from ai_modules.mpnet_retriever import retrieve_blood_donation_answer
from neo4j_service.neo4j_client import Neo4jClient


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

    # -------------------------
    # Admin workflows
    # -------------------------
    if role == "ADMIN":

        if "campaign" in query_lower or "ready donors" in query_lower:
            return Response(
                {
                    "intent": "admin_campaign_scan",
                    "role": role,
                    "message": (
                        "Admin campaign scans should be performed using the "
                        "campaign-ready donor API."
                    ),
                }
            )

        retriever_result = retrieve_blood_donation_answer(query)

        try:
            neo4j_client = Neo4jClient()

            neo4j_client.create_chatbot_trace(
                user_identifier=user.email,
                user_type="ADMIN",
                query=query,
                matched_question=retriever_result["matched_question"],
                answer=retriever_result["answer"],
                similarity_score=retriever_result["similarity_score"],
                confidence=retriever_result["confidence"],
            )

            neo4j_client.close()

        except Exception as e:
            print("Neo4j chatbot trace failed:", e)

        return Response(
            {
                "intent": "admin_general_question",
                "role": role,
                "retriever_result": retriever_result,
                "assistant_response": retriever_result["answer"],
            }
        )

    # -------------------------
    # Donor workflows
    # -------------------------
    if role == "DONOR":

        if "eligible" in query_lower:
            return Response(
                {
                    "intent": "donor_eligibility",
                    "role": role,
                    "message": (
                        "Use the eligibility endpoint for a verified eligibility assessment."
                    ),
                }
            )

        if "available" in query_lower:
            return Response(
                {
                    "intent": "donor_availability",
                    "role": role,
                    "message": (
                        "Use the availability endpoint for a verified availability assessment."
                    ),
                }
            )

        retriever_result = retrieve_blood_donation_answer(query)

        try:
            neo4j_client = Neo4jClient()

            neo4j_client.create_chatbot_trace(
                user_identifier=user.email,
                user_type="DONOR",
                query=query,
                matched_question=retriever_result["matched_question"],
                answer=retriever_result["answer"],
                similarity_score=retriever_result["similarity_score"],
                confidence=retriever_result["confidence"],
            )

            neo4j_client.close()

        except Exception as e:
            print("Neo4j chatbot trace failed:", e)

        return Response(
            {
                "intent": "general_donor_question",
                "role": role,
                "retriever_result": retriever_result,
                "assistant_response": retriever_result["answer"],
            }
        )

    # -------------------------
    # Guest workflows
    # -------------------------

    if (
        "where" in query_lower
        or "nearest" in query_lower
        or "camp" in query_lower
    ):
        return Response(
            {
                "intent": "guest_nearest_camp",
                "role": "GUEST",
                "message": (
                    "Please allow location access so the system can recommend "
                    "the nearest active donation camp."
                ),
            }
        )

    retriever_result = retrieve_blood_donation_answer(query)

    try:
        neo4j_client = Neo4jClient()

        neo4j_client.create_chatbot_trace(
            user_identifier="guest-user",
            user_type="GUEST",
            query=query,
            matched_question=retriever_result["matched_question"],
            answer=retriever_result["answer"],
            similarity_score=retriever_result["similarity_score"],
            confidence=retriever_result["confidence"],
        )

        neo4j_client.close()

    except Exception as e:
        print("Neo4j chatbot trace failed:", e)

    return Response(
        {
            "intent": "guest_general_question",
            "role": "GUEST",
            "retriever_result": retriever_result,
            "assistant_response": retriever_result["answer"],
        }
    )