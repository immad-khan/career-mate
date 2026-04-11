from django.urls import path
from .views import MarketTrendsView, MarketTrendsRefreshView

urlpatterns = [
    path('fetch/', MarketTrendsView.as_view(), name='market-trends-fetch'),
    path('refresh/', MarketTrendsRefreshView.as_view(), name='market-trends-refresh'),
]
