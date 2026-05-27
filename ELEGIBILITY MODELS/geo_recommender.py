import math
import pandas as pd


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculates distance between two GPS points in kilometers.
    """

    earth_radius_km = 6371

    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return earth_radius_km * c


def recommend_nearest_camp(user_lat, user_lon, camps_df):
    """
    camps_df must contain:
    camp_name, venue_name, district, latitude, longitude, status
    """

    active_camps = camps_df[camps_df["status"] == "Active"].copy()

    if active_camps.empty:
        return {
            "found": False,
            "message": "No active donation camps are currently available."
        }

    active_camps["distance_km"] = active_camps.apply(
        lambda row: haversine_distance(
            user_lat,
            user_lon,
            row["latitude"],
            row["longitude"]
        ),
        axis=1
    )

    nearest = active_camps.sort_values("distance_km").iloc[0]

    return {
        "found": True,
        "camp_id": nearest["camp_id"],
        "camp_name": nearest["camp_name"],
        "venue_name": nearest["venue_name"],
        "district": nearest["district"],
        "distance_km": round(nearest["distance_km"], 2),
        "latitude": nearest["latitude"],
        "longitude": nearest["longitude"]
    }