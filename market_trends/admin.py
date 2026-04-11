from django.contrib import admin
from .models import MarketTrendCache

@admin.register(MarketTrendCache)
class MarketTrendCacheAdmin(admin.ModelAdmin):
    list_display = ['field', 'updated_at']
    search_fields = ['field']
