def detect_intent(query: str) -> str:
    query = query.lower().strip()

    eligibility_keywords = [
        "eligible",
        "eligibility",
        "can i donate",
        "am i allowed",
        "fit to donate",
        "qualified to donate",
    ]

    availability_keywords = [
        "available",
        "availability",
        "donate again",
        "ready to donate",
        "when can i donate",
        "can i donate again",
    ]

    geospatial_keywords = [
        "nearest",
        "near me",
        "where",
        "location",
        "camp",
        "donation camp",
        "blood camp",
    ]

    combined_keywords = [
        "can i donate today",
        "am i ready to donate",
        "should i donate",
        "donor readiness",
    ]

    if any(word in query for word in combined_keywords):
        return "COMBINED"

    if any(word in query for word in geospatial_keywords):
        return "GEOSPATIAL"

    if any(word in query for word in eligibility_keywords):
        return "ELIGIBILITY"

    if any(word in query for word in availability_keywords):
        return "AVAILABILITY"

    return "CONVERSATIONAL"