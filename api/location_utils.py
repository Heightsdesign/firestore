########################
# location_utils.py
########################
import math
from typing import List, Dict, Optional
import geopandas as gpd
import requests
from shapely.geometry import Point
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

from .fetcher import (
    fetch_competitor_count,
    fetch_population,
    fetch_median_income,
    fetch_traffic_score,
    fetch_parking_score,
    cached_get
)
from .rent_agent import get_rent_score_from_coordinates
from .zip_cache import load_zip, save_zip


load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
shapefile_path = os.path.join(BASE_DIR, "data", "tl_2020_us_zcta520.shp")


zip_gdf = gpd.read_file(shapefile_path)
if zip_gdf.crs != "EPSG:4326":
    zip_gdf = zip_gdf.to_crs(epsg=4326)

#################################################
# 1. HELPER: get_zip_codes_within_radius
#################################################
def get_zip_codes_within_radius(lat, lng, radius_km):
    center_point = Point(lng, lat)
    deg_radius = radius_km / 111.0
    bounding_circle = center_point.buffer(deg_radius)
    intersecting = zip_gdf[zip_gdf.geometry.intersects(bounding_circle)]
    return intersecting[["ZCTA5CE20", "geometry"]]


def reverse_geocode_to_neighborhood(lat: float, lng: float) -> str | None:
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "latlng": f"{lat},{lng}",
        "key": GOOGLE_API_KEY
    }

    try:
        data = cached_get(url, params)

        for result in data.get("results", []):
            for component in result.get("address_components", []):
                if "neighborhood" in component["types"]:
                    return component["long_name"]
                if "sublocality" in component["types"]:
                    return component["long_name"]
                if "locality" in component["types"]:
                    return component["long_name"]
        return None

    except Exception as e:
        print(f"[ERROR] reverse_geocode_to_neighborhood failed for ({lat}, {lng}): {e}")
        return None
    

def reverse_geocode_to_city(lat: float, lng: float) -> str | None:
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "latlng": f"{lat},{lng}",
        "key": GOOGLE_API_KEY
    }

    try:
        data = cached_get(url, params)

        for result in data.get("results", []):
            for component in result.get("address_components", []):
                if "locality" in component["types"]:  # This is the city
                    return component["long_name"]
        return None

    except Exception as e:
        print(f"[ERROR] reverse_geocode_to_city failed for ({lat}, {lng}): {e}")
        return None


#################################################
# 2. HELPER: Evaluate single ZIP
#################################################
def evaluate_zip(zip_record, place_type: str = "restaurant", radius_m: int = 1000):
    try:
        centroid  = zip_record.geometry.centroid
        lat, lng  = centroid.y, centroid.x
        zip_code  = zip_record["ZCTA5CE20"]

        cached = load_zip(zip_code)   # <-- single‑arg call
        if cached is None:
            cached = {
                "zip":           zip_code,
                "lat":           lat,
                "lng":           lng,
                "population":    fetch_population(zip_code),
                "median_income": fetch_median_income(zip_code),
                "rent_cost":     get_rent_score_from_coordinates(lat, lng),
                "traffic_score": fetch_traffic_score(lat, lng, radius_m),
                "parking_score": fetch_parking_score(lat, lng, radius_m),
                "competitors":   {},
            }

        if place_type in cached["competitors"]:
            comp_cnt = cached["competitors"][place_type]
        else:
            comp_cnt = fetch_competitor_count((lat, lng), radius_m, place_type)
            cached["competitors"][place_type] = comp_cnt
            save_zip(zip_code, cached)        # <-- two‑arg call

        city = reverse_geocode_to_city(lat, lng)

        return {
            "zip":              zip_code,
            "lat":              cached["lat"],
            "lng":              cached["lng"],
            "population":       cached["population"],
            "median_income":    cached["median_income"],
            "rent_cost":        cached["rent_cost"],
            "competitor_count": comp_cnt,
            "traffic_score":    cached["traffic_score"],
            "parking_score":    cached["parking_score"],
            "city": city,
        }
    except Exception as e:
        print(f"[ERROR] evaluate_zip {zip_code}: {e}")
        return None


#################################################
# 3. HELPER: min-max normalize + compute final "score"
#################################################
def normalize_and_score(zones: List[Dict], weights: Dict[str, float]) -> List[Dict]:
    keys_positive = ["traffic_score", "parking_score", "population", "median_income"]
    keys_negative = ["rent_cost", "competitor_count"]

    valid_zones = [z for z in zones if all(z.get(k) is not None for k in keys_positive + keys_negative)]
    if not valid_zones:
        print("[DEBUG] No valid_zones found in normalize_and_score. Possibly missing data.")
        return []

    metric_ranges = {}
    for k in (keys_positive + keys_negative):
        vals = [z[k] for z in valid_zones]
        mn, mx = min(vals), max(vals)
        metric_ranges[k] = (mn, mx)

    for z in zones:
        if any(z.get(k) is None for k in keys_positive + keys_negative):
            z["score"] = None
            continue

        total_score = 0.0

        for k in keys_positive:
            mn, mx = metric_ranges[k]
            raw_norm = (z[k] - mn) / (mx - mn) if mx > mn else 1.0
            z[f"{k}_labelnorm"] = raw_norm
            z[f"{k}_label"] = label_score(raw_norm)
            total_score += raw_norm * weights.get(k.replace("_score", "").replace("competitor_count", "competition"), 0)

        for k in keys_negative:
            mn, mx = metric_ranges[k]
            if mx == mn:
                raw_norm = 0.0
            else:
                raw_norm = (z[k] - mn) / (mx - mn)
            inv_norm = 1 - raw_norm
            z[f"{k}_norm"] = inv_norm
            z[f"{k}_labelnorm"] = raw_norm
            total_score += inv_norm * weights.get(k.replace("_score", "").replace("competitor_count", "competition"), 0)

            if k == "rent_cost":
                print(f"[DEBUG] Normalized rent_cost for ZIP {z['zip']}: raw={z[k]}, inv_norm={inv_norm}, raw_norm={raw_norm}")

        z["score"] = round(total_score, 4)

    scored = [z for z in zones if z["score"] is not None]
    return sorted(scored, key=lambda x: x["score"], reverse=True)



#################################################
# 4. HELPER: Label each normalized metric ("Low","Med","High")
#################################################
def label_score(n: float) -> str:
    if n >= 0.66:
        return "High"
    elif n >= 0.33:
        return "Medium"
    else:
        return "Low"

def label_zone_metrics(zones: List[Dict]) -> None:
    """
    For each zone, read the "xxx_labelnorm" fields, produce "xxx_label" as Low/Medium/High
    e.g. competitor_count_labelnorm => competitor_count_label
    """
    metric_keys = ["traffic_score", "parking_score", "population", "median_income", "rent_cost", "competitor_count"]
    for z in zones:
        for k in metric_keys:
            labelnorm = z.get(f"{k}_labelnorm")
            if labelnorm is not None:
                z[f"{k}_label"] = label_score(labelnorm)
            else:
                z[f"{k}_label"] = None

#################################################
# 5. GPT: More positive-first commentary
#################################################
def fetch_lifestyle_fit(zone: Dict, business_type: str) -> Optional[str]:
    neighborhood = reverse_geocode_to_neighborhood(zone["lat"], zone["lng"])

    if neighborhood:
        zone_name = neighborhood
    else:
        zone_name = f"ZIP code {zone.get('zip', 'Unknown')}"

    llm = ChatOpenAI(model="gpt-4", temperature=0.5, openai_api_key=OPENAI_API_KEY)

    prompt = f"""
    You are helping assess whether a ZIP code or neighborhood is a good location to open a {business_type}.

    Base your assessment on the following metrics (normalized between 0 and 1):

    - Population: {zone['population']} → {zone.get('population_label')}
    - Median Income: ${zone['median_income']} → {zone.get('median_income_label')}
    - Rent Score: {zone['rent_cost']} → {zone.get('rent_cost_label')} (lower score means more expensive)
    - Competitor Count: {zone['competitor_count']} → {zone.get('competitor_count_label')}
    - Traffic Score: {zone['traffic_score']} → {zone.get('traffic_score_label')}
    - Parking Score: {zone['parking_score']} → {zone.get('parking_score_label')}

    Neighborhood: {zone_name}
    Latitude/Longitude: ({zone['lat']}, {zone['lng']})

    Now, in 3 short paragraphs:
    1. Start with **positive attributes** of the neighborhood.
    2. Mention any **challenges or drawbacks** that might affect the success of a {business_type}.
    3. Finish with a **recommendation summary** (e.g. “this location could be a good fit if…”).

    You are encouraged to add real-world context about the area based on the name and location. Be practical but constructive.
    """

    try:
        response = llm.invoke(prompt)
        return response.content.strip()
    except Exception as e:
        print(f"Error fetching lifestyle fit: {e}")
        return None

#################################################
# 6. The main rank_top_zones function
#################################################

def construct_loopnet_url(zip_code: str, lat: float, lng: float) -> Optional[str]:
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "latlng": f"{lat},{lng}",
        "key": GOOGLE_API_KEY
    }
    try:
        data = cached_get(url, params)
        results = data.get("results", [])

        city = state = None
        for result in results:
            for comp in result.get("address_components", []):
                if "locality" in comp["types"] and not city:
                    city = comp["short_name"]
                if "administrative_area_level_1" in comp["types"] and not state:
                    state = comp["short_name"]
            if city and state:
                break

        if city and state:
            slug = f"{city.lower().replace(' ', '-')}-{state.lower()}-{zip_code}"
            return f"https://www.loopnet.com/search/commercial-real-estate/{slug}/for-lease/"
        else:
            print(f"[WARN] Could not resolve city/state for ZIP {zip_code}")
            return None
    except Exception as e:
        print(f"[ERROR] Failed to construct LoopNet URL for ZIP {zip_code}: {e}")
        return None

def rank_top_zones(center_lat: float, center_lng: float, radius_km: float, weights: Dict[str, float], place_type: str = "restaurant", top_n: int = 5) -> List[Dict]:
    # 1) Identify candidate ZIPs
    zip_candidates = get_zip_codes_within_radius(center_lat, center_lng, radius_km)

    # 2) Evaluate each ZIP
    zones = []
    for _, row in zip_candidates.iterrows():
        result = evaluate_zip(row, place_type=place_type)
        if result:
            zones.append(result)

    # 3) Normalize metrics + compute final 'score'
    scored_zones = normalize_and_score(zones, weights)

    # 4) Label each metric with Low/Med/High
    label_zone_metrics(scored_zones)

    # 5) Add LoopNet commercial listing URLs
    for z in scored_zones:
        z["loopnet_url"] = construct_loopnet_url(z["zip"], z["lat"], z["lng"])

    # 6) Return top N scored zones
    return scored_zones[:top_n]
