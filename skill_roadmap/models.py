import uuid
from django.db import models
from django.conf import settings

class SkillRoadmap(models.Model):
    class Level(models.TextChoices):
        BEGINNER = 'beginner', 'Beginner'
        INTERMEDIATE = 'intermediate', 'Intermediate'
        ADVANCED = 'advanced', 'Advanced'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='roadmaps')
    role = models.CharField(max_length=255)
    level = models.CharField(max_length=20, choices=Level.choices, default=Level.BEGINNER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'skill_roadmaps'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.role} ({self.level}) - {self.user.email}"

class RoadmapSection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roadmap = models.ForeignKey(SkillRoadmap, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'roadmap_sections'
        ordering = ['order']

class RoadmapSkill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(RoadmapSection, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    resources = models.JSONField(default=list, help_text="List of learning resources (courses, articles, etc.)")
    order = models.PositiveIntegerField(default=0)
    
    # Progress tracking per user-roadmap instance
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'roadmap_skills'
        ordering = ['order']

class SkillBotChat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skillbot_chats')
    message = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'skillbot_chats'
        ordering = ['created_at']
