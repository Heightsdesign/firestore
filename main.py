import requests

API_KEY = "AIzaSyDt6-65ubyQMOP_EMxyBYzzEdx5eqUdRv0"
location = "25.7617,-80.1918"  # Downtown Miami lat,long
radius = 1500  # 1.5 km
place_type = "restaurant"

url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={location}&radius={radius}&type={place_type}&key={API_KEY}"

response = requests.get(url)
data = response.json()

competitor_count = len(data.get("results", []))
print(f"Number of competitors: {competitor_count}")
