import requests

def reverse_geocode(lat: float, lng: float) -> tuple[str, str]:
    """
    Given latitude and longitude, return (neighborhood, city).
    Falls back to city only if neighborhood not available.
    """
    try:
        url = f"https://nominatim.openstreetmap.org/reverse"
        params = {
            "lat": lat,
            "lon": lng,
            "format": "json",
            "addressdetails": 1,
            "zoom": 16
        }
        headers = {
            "User-Agent": "YourAppName (your_email@example.com)"  # Optional but recommended
        }
        response = requests.get(url, params=params, headers=headers)
        data = response.json()
        address = data.get("address", {})

        neighborhood = (
            address.get("neighbourhood") or
            address.get("suburb") or
            address.get("quarter") or
            address.get("borough") or
            address.get("city_district")
        )

        city = (
            address.get("city") or
            address.get("town") or
            address.get("village") or
            address.get("county")
        )

        if not city:
            raise ValueError("City not found in address data.")

        return (neighborhood or city, city)

    except Exception as e:
        print(f"[Reverse Geocode Error] ({lat}, {lng}): {e}")
        return ("Unknown", "Unknown")
