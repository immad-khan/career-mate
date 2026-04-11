from rest_framework import serializers
from .models import MarketTrendCache


class MarketTrendCacheSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketTrendCache
        fields = ['id', 'field', 'trend_data', 'google_trends_data', 'updated_at']
        read_only_fields = ['id', 'updated_at']
