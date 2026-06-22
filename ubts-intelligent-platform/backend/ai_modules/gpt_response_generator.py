import os
from openai import OpenAI


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_gpt_response(system_instruction, user_content, history=None):
    try:
        input_messages = [{"role": "system", "content": system_instruction}]
        if history:
            # Inject up to last 10 history items (5 user+assistant turns) for context
            input_messages.extend(history[-10:])
        input_messages.append({"role": "user", "content": user_content})

        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=input_messages,
            temperature=0.4,
            max_tokens=250,
        )

        return response.choices[0].message.content.strip()

    except Exception as error:
        print("GPT response generation failed:", error)
        return None


def format_conversational_response(query, retriever_result, history=None):
    system_instruction = """
You are the UBTS Intelligent Blood Donation Assistant.
You must only answer using the trusted retrieved blood donation answer.
If confidence is Moderate or Blood Domain Low, answer cautiously and say the answer is based on the closest trusted UBTS knowledge match.
Do not add medical claims that are not in the trusted answer.
Keep the response friendly, clear, and concise.
"""

    user_content = f"""
User question:
{query}

Trusted retrieved answer:
{retriever_result.get("answer")}

Confidence:
{retriever_result.get("confidence")}

Write a natural response for the user.
"""

    return generate_gpt_response(system_instruction, user_content, history=history)


def format_safe_decline_response(query, role):
    system_instruction = """
You are the UBTS Intelligent Blood Donation Assistant.
The user's question is outside the trusted blood donation knowledge base.
Politely decline to answer the question directly.
Do not give diagnosis, treatment, drug, legal, financial, or unrelated advice.
Redirect the user to UBTS medical staff.
Keep the response short and helpful.
"""

    user_content = f"""
User role:
{role}

User question:
{query}

Write a natural safe decline response.
"""

    return generate_gpt_response(system_instruction, user_content)


def format_eligibility_response(query, eligibility_result):
    system_instruction = """
You are the UBTS Intelligent Blood Donation Assistant.
Explain the eligibility result using only the rule-engine output provided.
Do not invent new medical rules.
Do not override the eligibility result.
Keep the response supportive and clear.
"""

    user_content = f"""
User question:
{query}

Eligibility result:
{eligibility_result}

Write a natural response explaining the result.
"""

    return generate_gpt_response(system_instruction, user_content)


def format_availability_response(query, availability_result):
    system_instruction = """
You are the UBTS Intelligent Blood Donation Assistant.
Explain the availability prediction using only the model output provided.
Do not invent model features.
Do not override the prediction.
Keep the response clear and simple.
"""

    user_content = f"""
User question:
{query}

Availability result:
{availability_result}

Write a natural response explaining the prediction.
"""

    return generate_gpt_response(system_instruction, user_content)


def format_combined_response(query, eligibility_result, availability_result, is_campaign_ready):
    system_instruction = """
You are the UBTS Intelligent Blood Donation Assistant.
Explain donor readiness using the eligibility result and availability result only.
Do not invent additional medical advice.
Keep the response short, clear, and supportive.
"""

    user_content = f"""
User question:
{query}

Eligibility result:
{eligibility_result}

Availability result:
{availability_result}

Campaign ready:
{is_campaign_ready}

Write a natural response explaining whether the donor appears ready to donate.
"""

    return generate_gpt_response(system_instruction, user_content)

def format_verified_response(response_type, result, donor_name=None):
    """
    Backward compatibility wrapper.
    Existing donor APIs still call this function.
    """

    try:
        name_prefix = f"The donor's name is {donor_name}. Please address them by their first name in the response. " if donor_name else ""

        if response_type == "eligibility":
            return format_eligibility_response(
                f"{name_prefix}Check my eligibility",
                result,
            )

        if response_type == "availability":
            return format_availability_response(
                f"{name_prefix}Check my availability",
                result,
            )

        return str(result)

    except Exception as e:
        print("format_verified_response error:", e)

        return result.get(
            "summary",
            "Assessment completed successfully.",
        )