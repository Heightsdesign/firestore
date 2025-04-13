import os
from langchain_openai import ChatOpenAI
from functools import lru_cache
from dotenv import load_dotenv
from .geo_utils import reverse_geocode

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = ChatOpenAI(model="gpt-4", temperature=0, openai_api_key=openai_api_key)

# Map GPT's output to numeric score
label_to_score = {
    "affordable": 0.8,
    "moderate": 0.5,
    "expensive": 0.2
}

@lru_cache(maxsize=512)
def get_rent_affordability_score(neighborhood: str, city: str) -> float:
    """
    Uses GPT to classify the rent level of a neighborhood as 'affordable', 'moderate', or 'expensive'.
    Returns a corresponding numeric score.
    """
    prompt = f"""
    You are a commercial real estate market expert with deep knowledge of neighborhood-level rent trends across major U.S. cities.

    Classify the *commercial rent level* of the following neighborhoods relative to others in the same city:

    Example:
    - 'SoHo', New York → expensive
    - 'South Bronx', New York → affordable
    - 'Financial District', San Francisco → expensive
    - 'Oakland', San Francisco Bay Area → moderate
    - 'Wynwood', Miami → expensive
    - 'Hialeah', Miami → affordable

    Now classify:
    - '{neighborhood}', {city} →

    Return only one word: affordable, moderate, or expensive.
    """

    try:
        response = llm.invoke(prompt)
        label = response.content.strip().lower()
        return label_to_score.get(label, 0.5)  # fallback to 'moderate' score if unexpected
    except Exception as e:
        print(f"Error fetching affordability score for {neighborhood}, {city}: {e}")
        return 0.5  # neutral default on failure


def get_rent_score_from_coordinates(lat: float, lng: float) -> float:
    try:
        neighborhood, city = reverse_geocode(lat, lng)
        return get_rent_affordability_score(neighborhood, city)
    except Exception as e:
        print(f"Error resolving rent score for ({lat}, {lng}): {e}")
        return 0.5


# --- Simple test run ---
if __name__ == "__main__":
    test_inputs = [
        ("Brickell", "Miami"),
        ("Little Havana", "Miami"),
        ("Allapattah", "Miami"),
        ("Downtown", "Los Angeles"),
        ("Bushwick", "New York")
    ]

    for neighborhood, city in test_inputs:
        score = get_rent_affordability_score(neighborhood, city)
        print(f"{neighborhood}, {city} → Rent Score: {score}")

    print("\n--- Coordinates test ---")
    coords = [
        (25.762, -80.1918),  # Brickell
        (25.779, -80.219),   # Allapattah
        (25.768, -80.235),   # Little Havana
        (34.0469, -118.2519),# Downtown LA
        (40.695, -73.918)    # Bushwick
    ]

    for lat, lng in coords:
        score = get_rent_score_from_coordinates(lat, lng)
        print(f"({lat}, {lng}) → Rent Score: {score}")

