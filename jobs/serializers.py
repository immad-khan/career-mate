from rest_framework import serializers
from .models import Job, Application, Notification
from accounts.models import HRProfile, JobSeekerProfile

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='hr_profile.company_name', read_only=True)
    hr_name = serializers.CharField(source='hr_profile.user.full_name', read_only=True)

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('hr_profile',)

class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'title', 'description', 'required_skills', 
            'salary_min', 'salary_max', 'job_type', 
            'experience_level'
        ]

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_seeker_name = serializers.CharField(source='job_seeker.user.full_name', read_only=True)
    job_seeker_email = serializers.CharField(source='job_seeker.user.email', read_only=True)

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('job_seeker', 'status')

class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['job', 'cover_letter', 'resume']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user',)
