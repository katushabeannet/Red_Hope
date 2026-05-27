def retrieve_blood_donation_answer(query):
    """
    Temporary MPNet retriever placeholder.

    Later, this file will load the fine-tuned MPNet model and retrieve
    the best matching blood donation answer from the Q&A knowledge base.
    """

    query_lower = query.lower()

    if "who can donate" in query_lower or "eligible" in query_lower:
        return {
            "matched_question": "Who can donate blood?",
            "answer": (
                "Generally, a blood donor should be in good health, meet the minimum age "
                "and weight requirements, and should not have conditions that temporarily "
                "or permanently prevent donation."
            ),
            "similarity_score": 0.86,
            "confidence": "High",
        }

    if "how often" in query_lower or "donate again" in query_lower:
        return {
            "matched_question": "How often can someone donate blood?",
            "answer": (
                "A person is usually advised to wait for a safe donation interval before "
                "donating again. In this system, the sample rule uses at least 90 days."
            ),
            "similarity_score": 0.88,
            "confidence": "High",
        }

    if "safe" in query_lower:
        return {
            "matched_question": "Is blood donation safe?",
            "answer": (
                "Blood donation is generally safe when done under proper medical supervision "
                "using sterile equipment and standard screening procedures."
            ),
            "similarity_score": 0.84,
            "confidence": "Moderate",
        }

    return {
        "matched_question": "General blood donation information",
        "answer": (
            "Blood donation helps save lives by providing blood for patients who need transfusions. "
            "You can ask about eligibility, donation intervals, safety, or where to donate."
        ),
        "similarity_score": 0.75,
        "confidence": "Moderate",
    }