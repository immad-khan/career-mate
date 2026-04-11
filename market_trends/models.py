from django.db import models
from django.utils import timezone


class MarketTrendCache(models.Model):
    """Stores the last fetched trend data per field for fallback purposes."""
    field = models.CharField(max_length=200, unique=True, db_index=True)
    trend_data = models.JSONField(default=dict)
    google_trends_data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Trends: {self.field} (updated {self.updated_at})"
