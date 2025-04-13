# test_analysis_zip.py

from location_utils import rank_top_zones, fetch_lifestyle_fit
from dotenv import load_dotenv
import os

load_dotenv()

# Coordinates for Downtown Los Angeles
center_lng = -118.2437
center_lat = 34.0522
radius_km = 5  # Search radius

weights = {
    "rent": 0.2,
    "competition": 0.2,
    "population": 0.3,
    "income": 0.1,
    "traffic": 0.0,
    "parking": 0.1
}

business_type = "barbershop"

print("\n🔍 Starting ZIP-based location analysis...\n")

top_zips = rank_top_zones(
    center_lat=center_lat,
    center_lng=center_lng,
    radius_km=radius_km,
    weights=weights,
    place_type=business_type,
    top_n=5
)

if not top_zips:
    print("❌ No ZIP codes scored successfully.")
else:
    for idx, zone in enumerate(top_zips, 1):
        print(f"\n#{idx} 🧭 ZIP: {zone['zip']} | Overall Score: {zone['score']}")

        # Raw metric values
        print(f"   - Centroid: ({round(zone['lat'], 4)}, {round(zone['lng'], 4)})")
        print(f"   - Population: {zone['population']} => {zone.get('population_label')}")
        print(f"   - Median Income: ${zone['median_income']} => {zone.get('median_income_label')}")
        print(
            f"   - Rent Cost: {zone['rent_cost']} => {zone.get('rent_cost_label')} (lower score means more expensive)")
        print(f"   - Competitor Count: {zone['competitor_count']} => {zone.get('competitor_count_label')}")
        print(f"   - Traffic Score: {zone['traffic_score']} => {zone.get('traffic_score_label')}")
        print(f"   - Parking Score: {zone['parking_score']} => {zone.get('parking_score_label')}")
        print(f"   - URL: {zone['loopnet_url']}")

        # GPT commentary
        insight = fetch_lifestyle_fit(zone, business_type)
        if insight:
            print(f"   💬 GPT Insight: {insight}")

print("\n✅ ZIP-based test completed.\n")

