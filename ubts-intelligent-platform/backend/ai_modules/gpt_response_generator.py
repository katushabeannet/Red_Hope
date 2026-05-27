from openai import OpenAI
import json

client = OpenAI()


def generate_human_response(user_query, system_result, user_mode="donor"):
    """
    GPT only converts verified system results into natural language.
    It must not create new eligibility, availability, or location decisions.
    """

    instructions = """
You are a friendly UBTS blood donation assistant.

Use only the verified system result provided.
Do not invent medical facts, eligibility decisions, probabilities, donor records, or locations.
If the system result is missing personal data, ask the user to sign in or provide temporary details.
If the user is a guest, do not claim to know their donor record.
If the response involves eligibility, explain it gently and clearly.
If a donation camp is provided, mention it clearly.
If location permission is missing, ask the user to turn on location for live directions.
Keep the response natural, supportive, and concise.
"""

    input_payload = {
        "user_mode": user_mode,
        "user_query": user_query,
        "verified_system_result": system_result
    }

    response = client.responses.create(
        model="gpt-5.5",
        instructions=instructions,
        input=json.dumps(input_payload, indent=2)
    )

    return response.output_text