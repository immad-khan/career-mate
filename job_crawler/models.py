from django.db import models
from accounts.models import CustomUser
import uuid

class SavedJob(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='saved_jobs')
    job_id = models.CharField(max_length=255) # ID from external source
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    salary = models.CharField(max_length=255, blank=True, null=True)
    job_url = models.URLField(max_length=1000)
    source = models.CharField(max_length=50) # e.g., 'LinkedIn', 'Indeed'
    posted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'saved_jobs'
        unique_together = ('user', 'job_id')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.company} (Saved by {self.user.email})"

class AppliedJob(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='applied_jobs')
    job_id = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='Applied')
    
    class Meta:
        db_table = 'applied_jobs'
        unique_together = ('user', 'job_id')
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.title} at {self.company} (Applied by {self.user.email})"
