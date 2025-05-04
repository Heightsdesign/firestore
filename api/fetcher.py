import requests
import time
import os
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dotenv import load_dotenv
import sqlite3, hashlib, json, threading


# Caching config
CACHE_TTL = 30 * 24 * 3600            # 30 days (Google Maps TOS)
_CACHE_LOCK = threading.Lock()        # sqlite is threadsafe w/ a mutex
DB = sqlite3.connect(
    os.path.join(BASE_DIR := os.path.dirname(__file__), "places_cache.sqlite"),
    check_same_thread=False,
)
DB.execute("""CREATE TABLE IF NOT EXISTS places_cache (
                cache_key     TEXT PRIMARY KEY,
                json_response TEXT NOT NULL,
                created_at    INTEGER NOT NULL
             )""")
DB.execute("CREATE INDEX IF NOT EXISTS idx_age ON places_cache(created_at)")
DB.commit()

# API config
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
CENSUS_API_KEY = os.getenv("CENSUS_API_KEY")
CENSUS_YEAR = 2022


def _mk_cache_key(endpoint: str, params: dict) -> str:
    """Stable SHA‑256 hash of endpoint + sorted params **excluding the API key**."""
    p = {k: params[k] for k in sorted(params) if k != "key"}
    blob = endpoint + "?" + "&".join(f"{k}={p[k]}" for k in p)
    return hashlib.sha256(blob.encode()).hexdigest()


def cached_get(endpoint: str, params: dict, ttl: int = CACHE_TTL) -> dict:
    """Return JSON payload from cache or live request, transparently."""
    key = _mk_cache_key(endpoint, params)
    now = int(time.time())

    # ---- lookup
    with _CACHE_LOCK:
        row = DB.execute(
            "SELECT json_response, created_at FROM places_cache WHERE cache_key = ?",
            (key,),
        ).fetchone()

    if row and now - row[1] < ttl:
        print(f"[CACHE‑HIT] {endpoint.split('/')[-1]}  params={params}")
        return json.loads(row[0])            # HIT ✅
    
    print(f"[CACHE‑MISS] {endpoint.split('/')[-1]}  params={params}")

    # ---- miss → hit Google
    resp = session.get(endpoint, params=params, timeout=5)
    resp.raise_for_status()
    data = resp.json()

    # cache only successful responses (status=OK | ZERO_RESULTS)
    if data.get("status") in {"OK", "ZERO_RESULTS"}:
        with _CACHE_LOCK:
            DB.execute(
                "INSERT OR REPLACE INTO places_cache VALUES (?,?,?)",
                (key, json.dumps(data), now),
            )
            DB.commit()

    return data

# Configure retry session
def requests_session_with_retries():
    session = requests.Session()
    retries = Retry(total=5, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
    adapter = HTTPAdapter(max_retries=retries)
    session.mount('https://', adapter)
    session.mount('http://', adapter)
    return session

session = requests_session_with_retries()

# --- Reverse geocoding --- #
def reverse_geocode_to_zip(lat: float, lng: float):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "latlng": f"{lat},{lng}",
        "key": GOOGLE_API_KEY
    }
    try:
        print(f"[DEBUG] Requesting ZIP for ({lat}, {lng})")
        #response = session.get(url, params=params)

        # print(f"[DEBUG] Status Code: {response.status_code}")
        # print(f"[DEBUG] Response Text: {response.text[:300]}...")  # Print partial text to avoid overflow

        data = cached_get(url, params)

        if response.status_code == 200 and "results" in data:
            for result in data["results"]:
                for component in result["address_components"]:
                    if "postal_code" in component["types"]:
                        return component["short_name"]

        print(f"[WARN] No ZIP found in geocode response for ({lat}, {lng})")
        return None

    except Exception as e:
        print(f"[ERROR] reverse_geocode_to_zip failed for ({lat}, {lng}): {e}")
        return None


# --- Census Fetching (ZIP-Based) --- #
def fetch_population(zip_code):

    url = f"https://api.census.gov/data/{CENSUS_YEAR}/acs/acs5"
    params = {
        "get": "B01003_001E",  # Total population
        "for": f"zip code tabulation area:{zip_code}",
        "key": CENSUS_API_KEY
    }
    try:
        response = session.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        return int(data[1][0])
    except Exception as e:
        print(f"Error fetching population for ZIP {zip_code}: {e}")
        return None

def fetch_median_income(zip_code):

    url = f"https://api.census.gov/data/{CENSUS_YEAR}/acs/acs5"
    params = {
        "get": "B19013_001E",  # Median household income
        "for": f"zip code tabulation area:{zip_code}",
        "key": CENSUS_API_KEY
    }
    try:
        response = session.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        income_val = int(data[1][0])
        if income_val < 0:
            income_val = None
        return income_val

    except Exception as e:
        print(f"Error fetching median income for ZIP {zip_code}: {e}")
        return None

# --- Google Places Metrics --- #
def fetch_competitor_count(location: tuple, radius: int, place_type: str):
    endpoint_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{location[0]},{location[1]}",
        "radius": radius,
        "type": place_type,
        "key": GOOGLE_API_KEY
    }
    competitor_count = 0
    while True:

        # res = requests.get(endpoint_url, params=params).json()
        res = cached_get(endpoint_url, params)
        if res.get("status") != "OK":
            print(f"Google Places API Error: {res.get('status')}")
            break

        competitor_count += len(res.get("results", []))

        if "next_page_token" in res:
            time.sleep(2)
            params["pagetoken"] = res["next_page_token"]
        else:
            break
    return competitor_count

def fetch_traffic_score(lat: float, lng: float, radius_m: int = 300) -> int:
    types = ["transit_station", "bus_station", "train_station"]
    count = 0
    for place_type in types:
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": f"{lat},{lng}",
            "radius": radius_m,
            "type": place_type,
            "key": GOOGLE_API_KEY
        }
        # response = requests.get(url, params=params).json()
        response = cached_get(url, params) 
        count += len(response.get("results", []))
        time.sleep(0.1)
    return count

def fetch_parking_score(lat: float, lng: float, radius_m: int = 300) -> int:
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius_m,
        "type": "parking",
        "key": GOOGLE_API_KEY
    }
    # response = requests.get(url, params=params).json()
    response = cached_get(url, params) 
    return len(response.get("results", []))
