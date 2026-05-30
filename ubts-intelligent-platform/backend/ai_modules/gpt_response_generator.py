def format_verified_response(result_type, verified_data):
    """
    Formats verified backend results into user-friendly responses.

    IMPORTANT:
    This formatter does not make medical, eligibility, availability,
    or nearest-camp decisions. It only explains results that have already
    been produced by trusted backend modules.
    """

    if result_type == "eligibility":
        reasons = verified_data.get("reasons", [])

        if reasons:
            reason_text = " ".join([f"- {reason}" for reason in reasons])
        else:
            reason_text = "No blocking reason was found."

        return (
            f"{verified_data.get('summary', 'Eligibility assessment completed.')} "
            f"{reason_text}"
        )

    if result_type == "availability":
        reasons = verified_data.get("reasons", [])

        if reasons:
            reason_text = " ".join([f"- {reason}" for reason in reasons])
        else:
            reason_text = "No major availability concern was found."

        return (
            f"{verified_data.get('summary', 'Availability assessment completed.')} "
            f"The estimated availability probability is "
            f"{verified_data.get('availability_probability')}. "
            f"{reason_text}"
        )

    if result_type == "nearest_camp":
        camp = verified_data.get("nearest_camp", {})
        distance = verified_data.get("distance_km")

        return (
            f"The nearest active blood donation camp is {camp.get('name')} "
            f"at {camp.get('venue')}, {camp.get('district')}. "
            f"It is approximately {distance} km from your current location."
        )

    return "Your request has been processed using verified UBTS system data."