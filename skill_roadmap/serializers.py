from rest_framework import serializers
from .models import SkillRoadmap, RoadmapSection, RoadmapSkill, SkillBotChat

class RoadmapSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadmapSkill
        fields = ['id', 'name', 'description', 'resources', 'is_completed', 'completed_at', 'order']

class RoadmapSectionSerializer(serializers.ModelSerializer):
    skills = RoadmapSkillSerializer(many=True, read_only=True)
    
    class Meta:
        model = RoadmapSection
        fields = ['id', 'title', 'description', 'order', 'skills']

class SkillRoadmapSerializer(serializers.ModelSerializer):
    sections = RoadmapSectionSerializer(many=True, read_only=True)
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = SkillRoadmap
        fields = ['id', 'role', 'level', 'created_at', 'updated_at', 'sections', 'completion_percentage', 'is_active']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_completion_percentage(self, obj):
        all_skills = RoadmapSkill.objects.filter(section__roadmap=obj).count()
        if all_skills == 0:
            return 0
        completed_skills = RoadmapSkill.objects.filter(section__roadmap=obj, is_completed=True).count()
        return round((completed_skills / all_skills) * 100)

class SkillBotChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillBotChat
        fields = ['id', 'message', 'response', 'created_at']
        read_only_fields = ['id', 'created_at', 'response']
