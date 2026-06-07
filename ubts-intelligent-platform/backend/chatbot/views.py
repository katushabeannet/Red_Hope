from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from ai_modules.router.unified_router import route_chatbot_query
from neo4j_service.neo4j_client import Neo4jClient


def save_chatbot_trace(user_identifier, user_type, query, result):
    try:
        retriever_result = result.get("retriever_result", {})

        neo4j_client = Neo4jClient()

        neo4j_client.create_chatbot_trace(
            user_identifier=user_identifier,
            user_type=user_type,
            user_query=query,
            matched_question=retriever_result.get(
                "matched_question",
                result.get("mode", "N/A"),
            ),
            answer=result.get("assistant_response", ""),
            similarity_score=retriever_result.get("similarity_score", 0),
            confidence=retriever_result.get(
                "confidence",
                result.get("mode", "N/A"),
            ),
        )

        neo4j_client.close()

    except Exception as e:
        print("Neo4j chatbot trace failed:", e)


@api_view(["POST"])
@permission_classes([AllowAny])
def chatbot_router_view(request):
    try:
        query = request.data.get("query", "").strip()

        if not query:
            return Response(
                {"error": "Query is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user if request.user.is_authenticated else None
        role = getattr(user, "role", "GUEST") if user else "GUEST"

        result = route_chatbot_query(query=query, user=user)

        user_identifier = user.email if user else "guest-user"

        save_chatbot_trace(
            user_identifier=user_identifier,
            user_type=role,
            query=query,
            result=result,
        )

        return Response(result)

    except Exception as e:
        print("Chatbot API failed:", e)

        return Response(
            {
                "error": "Chatbot backend failed.",
                "details": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )