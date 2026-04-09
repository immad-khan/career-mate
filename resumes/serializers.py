from rest_framework import serializers
from .models import (
    ResumeTemplate,
    Resume,
    PersonalInfo,
    Education,
    Experience,
    Skill,
    Project,
    Certification,
    Language,
    Reference,
    CustomSection,
)


# ==================== TEMPLATE SERIALIZERS ====================

class ResumeTemplateSerializer(serializers.ModelSerializer):
    """Resume template serializer"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = ResumeTemplate
        fields = [
            'id', 'name', 'slug', 'category', 'category_display',
            'description', 'thumbnail', 'is_premium', 'token_cost',
            'primary_color', 'is_active'
        ]


# ==================== SECTION SERIALIZERS ====================

class PersonalInfoSerializer(serializers.ModelSerializer):
    """Personal info serializer"""
    
    class Meta:
        model = PersonalInfo
        fields = [
            'id', 'full_name', 'email', 'phone',
            'address', 'city', 'state', 'country', 'zip_code',
            'linkedin', 'github', 'portfolio', 'website',
            'summary', 'photo_url'
        ]
        read_only_fields = ['id']


class EducationSerializer(serializers.ModelSerializer):
    """Education serializer"""
    
    class Meta:
        model = Education
        fields = [
            'id', 'institution', 'degree', 'field_of_study', 'location',
            'start_date', 'end_date', 'is_current',
            'gpa', 'description', 'achievements', 'order'
        ]
        read_only_fields = ['id']
    
    def validate(self, attrs):
        if attrs.get('is_current'):
            attrs['end_date'] = None
        elif not attrs.get('end_date'):
            raise serializers.ValidationError({
                'end_date': 'End date is required when not currently enrolled'
            })
        return attrs


class ExperienceSerializer(serializers.ModelSerializer):
    """Experience serializer"""
    employment_type_display = serializers.CharField(
        source='get_employment_type_display',
        read_only=True
    )
    
    class Meta:
        model = Experience
        fields = [
            'id', 'company', 'position', 'employment_type', 'employment_type_display',
            'location', 'is_remote',
            'start_date', 'end_date', 'is_current',
            'description', 'responsibilities', 'achievements', 'order'
        ]
        read_only_fields = ['id']
    
    def validate(self, attrs):
        if attrs.get('is_current'):
            attrs['end_date'] = None
        elif not attrs.get('end_date'):
            raise serializers.ValidationError({
                'end_date': 'End date is required when not currently working'
            })
        return attrs


class SkillSerializer(serializers.ModelSerializer):
    """Skill serializer"""
    proficiency_display = serializers.CharField(
        source='get_proficiency_display',
        read_only=True
    )
    category_display = serializers.CharField(
        source='get_category_display',
        read_only=True
    )
    
    class Meta:
        model = Skill
        fields = [
            'id', 'name', 'category', 'category_display',
            'proficiency', 'proficiency_display',
            'years_of_experience', 'order'
        ]
        read_only_fields = ['id']


class ProjectSerializer(serializers.ModelSerializer):
    """Project serializer"""
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'technologies',
            'start_date', 'end_date', 'is_ongoing',
            'url', 'github_url', 'highlights', 'order'
        ]
        read_only_fields = ['id']


class CertificationSerializer(serializers.ModelSerializer):
    """Certification serializer"""
    
    class Meta:
        model = Certification
        fields = [
            'id', 'name', 'issuing_organization',
            'issue_date', 'expiry_date', 'has_no_expiry',
            'credential_id', 'credential_url', 'order'
        ]
        read_only_fields = ['id']


class LanguageSerializer(serializers.ModelSerializer):
    """Language serializer"""
    proficiency_display = serializers.CharField(
        source='get_proficiency_display',
        read_only=True
    )
    
    class Meta:
        model = Language
        fields = ['id', 'name', 'proficiency', 'proficiency_display', 'order']
        read_only_fields = ['id']


class ReferenceSerializer(serializers.ModelSerializer):
    """Reference serializer"""
    
    class Meta:
        model = Reference
        fields = [
            'id', 'name', 'position', 'company',
            'email', 'phone', 'relationship', 'order'
        ]
        read_only_fields = ['id']


class CustomSectionSerializer(serializers.ModelSerializer):
    """Custom section serializer"""
    
    class Meta:
        model = CustomSection
        fields = ['id', 'title', 'content', 'order']
        read_only_fields = ['id']


# ==================== RESUME SERIALIZERS ====================

class ResumeListSerializer(serializers.ModelSerializer):
    """Resume list serializer (minimal data)"""
    template_name = serializers.CharField(source='template.name', read_only=True)
    completion_percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Resume
        fields = [
            'id', 'title', 'template', 'template_name',
            'status', 'primary_color', 'completion_percentage',
            'created_at', 'updated_at'
        ]


class ResumeDetailSerializer(serializers.ModelSerializer):
    """Resume detail serializer (full data)"""
    template = ResumeTemplateSerializer(read_only=True)
    personal_info = PersonalInfoSerializer(read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    references = ReferenceSerializer(many=True, read_only=True)
    custom_sections = CustomSectionSerializer(many=True, read_only=True)
    completion_percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Resume
        fields = [
            'id', 'title', 'template', 'status', 'primary_color',
            'completion_percentage',
            'personal_info', 'education', 'experiences', 'skills',
            'projects', 'certifications', 'languages', 'references',
            'custom_sections',
            'created_at', 'updated_at'
        ]


class ResumeCreateSerializer(serializers.ModelSerializer):
    """Resume create serializer"""
    
    class Meta:
        model = Resume
        fields = ['title', 'template', 'primary_color']
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class ResumeUpdateSerializer(serializers.ModelSerializer):
    """Resume update serializer"""
    
    class Meta:
        model = Resume
        fields = ['title', 'template', 'status', 'primary_color']


# ==================== BULK OPERATIONS ====================

class BulkSkillSerializer(serializers.Serializer):
    """Bulk add skills"""
    skills = serializers.ListField(
        child=serializers.CharField(max_length=100),
        min_length=1,
        max_length=50
    )
    category = serializers.ChoiceField(choices=Skill.SkillCategory.choices)
    proficiency = serializers.ChoiceField(
        choices=Skill.ProficiencyLevel.choices,
        default='intermediate'
    )


class ReorderItemsSerializer(serializers.Serializer):
    """Reorder items"""
    items = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )