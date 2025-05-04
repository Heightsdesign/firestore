from django.urls import path
from . import views
from .views import ReviewListCreateView

urlpatterns = [
    path('analyze/', views.analyze_location),
    path('reviews/', ReviewListCreateView.as_view(), name='review-list-create'),
]
