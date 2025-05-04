from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework import generics
import json

from .location_utils import rank_top_zones, fetch_lifestyle_fit
from .models import Review
from .serializers import ReviewSerializer

from sqlite3 import connect, Row


@csrf_exempt
def analyze_location(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            center_lat = data.get('lat')
            center_lng = data.get('lng')
            radius_km = data.get('radius_km', 5)  # default radius
            weights = data.get('weights', {})
            business_type = data.get('business_type', 'restaurant')  # default type

            if not center_lat or not center_lng:
                return JsonResponse({'success': False, 'error': 'Missing coordinates'}, status=400)
            

            db = connect("api/places_cache.sqlite")
            db.row_factory = Row
            print("zip_analysis_cache columns →",
                [r["name"] for r in db.execute("PRAGMA table_info(zip_analysis_cache);")])
            db.close()

            # Run the actual analysis
            top_zips = rank_top_zones(
                center_lat=center_lat,
                center_lng=center_lng,
                radius_km=radius_km,
                weights=weights,
                place_type=business_type,
                top_n=5
            )

            # Add GPT commentary to each result
            for zone in top_zips:
                zone['gpt_insight'] = fetch_lifestyle_fit(zone, business_type)

            return JsonResponse({'success': True, 'results': top_zips})

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'error': 'POST request required'}, status=405)



class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.order_by('-created_at')[:10]
    serializer_class = ReviewSerializer
