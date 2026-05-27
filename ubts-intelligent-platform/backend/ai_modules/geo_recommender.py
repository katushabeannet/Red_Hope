from math import radians, sin, cos, sqrt, atan2


def haversine_distance_km(lat1, lon1, lat2, lon2):
    """
    Calculates distance between two points on earth using the Haversine formula.
    Returns distance in kilometers.
    """
    earth_radius_km = 6371

    lat1 = radians(float(lat1))
    lon1 = radians(float(lon1))
    lat2 = radians(float(lat2))
    lon2 = radians(float(lon2))

    diff_lat = lat2 - lat1
    diff_lon = lon2 - lon1

    a = (
        sin(diff_lat / 2) ** 2
        + cos(lat1) * cos(lat2) * sin(diff_lon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return earth_radius_km * c


def find_nearest_camp(user_latitude, user_longitude, camps):
    """
    Receives user coordinates and active camps.
    Returns nearest camp plus distance.
    """
    nearest_camp = None
    shortest_distance = None

    for camp in camps:
        distance = haversine_distance_km(
            user_latitude,
            user_longitude,
            camp.latitude,
            camp.longitude,
        )

        if shortest_distance is None or distance < shortest_distance:
            shortest_distance = distance
            nearest_camp = camp

    if nearest_camp is None:
        return None

    return {
        "camp": nearest_camp,
        "distance_km": round(shortest_distance, 2),
    }