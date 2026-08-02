from rest_framework import serializers
from django.urls import reverse
from .models import Job, Application, Notification
from accounts.models import HRProfile, JobSeekerProfile
from accounts.serializers import JobSeekerProfileSerializer

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
    company_name = serializers.CharField(source='job.hr_profile.company_name', read_only=True)
    job_seeker_profile = JobSeekerProfileSerializer(source='job_seeker', read_only=True)
    # Use the authorized application endpoint instead of a direct Cloudinary URL.
    resume = serializers.SerializerMethodField()

    def get_resume(self, obj):
        if not obj.resume:
            return None
        path = reverse('application-resume', kwargs={'pk': obj.pk})
        request = self.context.get('request')
        return request.build_absolute_uri(path) if request else path

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('job_seeker', 'status')

class ApplicationCreateSerializer(serializers.ModelSerializer):
    resume = serializers.FileField(required=True, write_only=True)

    class Meta:
        model = Application
        fields = ['job', 'cover_letter', 'resume']

    def validate_resume(self, value):
        max_size = 5 * 1024 * 1024
        allowed_extensions = {'.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'}
        extension = value.name.rsplit('.', 1)[-1].lower() if '.' in value.name else ''

        if value.size > max_size:
            raise serializers.ValidationError('Resume file size must be 5 MB or less.')
        if f'.{extension}' not in allowed_extensions:
            raise serializers.ValidationError('Upload your resume as a PDF, DOC, DOCX, PNG, or JPG file.')
        return value

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user',)
