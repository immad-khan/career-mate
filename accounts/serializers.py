from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.conf import settings
import cloudinary.utils
import cloudinary

# Configure Cloudinary
cloudinary.config(
    cloud_name=getattr(settings, 'CLOUDINARY_STORAGE', {}).get('CLOUD_NAME'),
    api_key=getattr(settings, 'CLOUDINARY_STORAGE', {}).get('API_KEY'),
    api_secret=getattr(settings, 'CLOUDINARY_STORAGE', {}).get('API_SECRET')
)

from .models import (
    CustomUser, 
    JobSeekerProfile, 
    HRProfile, 
    EmailVerification,
    PasswordReset,
    JobSeekerSkill,
    JobSeekerPortfolioItem,
    JobSeekerEducation,
    JobSeekerLanguage
)


# ==================== User Serializers ====================

class JobSeekerSkillSerializer(serializers.ModelSerializer):
    proficiency = serializers.CharField(required=False)

    class Meta:
        model = JobSeekerSkill
        fields = ['id', 'name', 'percentage', 'proficiency']
        extra_kwargs = {
            'percentage': {'required': False}
        }

    def get_proficiency(self, obj):
        val = obj.percentage
        if val >= 90:
            return 'Expert'
        elif val >= 75:
            return 'Advanced'
        elif val >= 50:
            return 'Intermediate'
        else:
            return 'Beginner'

    def to_internal_value(self, data):
        ret = super().to_internal_value(data)
        if 'proficiency' in data:
            prof = data['proficiency']
            mapping = {
                'Expert': 90,
                'Advanced': 75,
                'Intermediate': 60,
                'Beginner': 35
            }
            ret['percentage'] = mapping.get(prof, 50)
        
        if 'proficiency' in ret:
            del ret['proficiency']
            
        return ret

class JobSeekerPortfolioItemSerializer(serializers.ModelSerializer):
    url = serializers.URLField(source='link', required=False, allow_null=True)
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = JobSeekerPortfolioItem
        fields = ['id', 'title', 'description', 'image_url', 'url', 'technologies', 'image']
        extra_kwargs = {'image': {'write_only': True}}
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class JobSeekerEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSeekerEducation
        fields = ['id', 'degree', 'institution', 'year', 'field_of_study', 'start_date', 'end_date', 'is_current']

class JobSeekerLanguageSerializer(serializers.ModelSerializer):
    language = serializers.CharField(source='name')
    proficiency = serializers.CharField(required=False)

    class Meta:
        model = JobSeekerLanguage
        fields = ['id', 'language', 'proficiency', 'proficiency_percentage']
        extra_kwargs = {
            'proficiency_percentage': {'required': False}
        }

    def get_proficiency(self, obj):
        val = obj.proficiency_percentage
        if val >= 100:
            return 'Native'
        elif val >= 80:
            return 'Fluent'
        elif val >= 70:
            return 'Full Professional'
        elif val >= 50:
            return 'Professional Working'
        else:
            return 'Elementary'

    def to_internal_value(self, data):
        ret = super().to_internal_value(data)
        if 'proficiency' in data:
            proficiency_str = data['proficiency']
            mapping = {
                'Native': 100,
                'Fluent': 80,
                'Full Professional': 70,
                'Professional Working': 50,
                'Elementary': 30
            }
            ret['proficiency_percentage'] = mapping.get(proficiency_str, 70)
            
        if 'proficiency' in ret:
            del ret['proficiency']
            
        return ret

class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer for responses"""
    profile_picture_url = serializers.SerializerMethodField()
    skills = JobSeekerSkillSerializer(many=True, read_only=True)
    portfolio_items = JobSeekerPortfolioItemSerializer(many=True, read_only=True)
    education_entries = JobSeekerEducationSerializer(many=True, read_only=True)
    languages = JobSeekerLanguageSerializer(many=True, read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'full_name', 'role', 
            'profile_picture_url', 'is_email_verified',
            'is_google_user', 'created_at',
            'skills', 'portfolio_items', 'education_entries', 'languages'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None


class JobSeekerProfileSerializer(serializers.ModelSerializer):
    """Job Seeker profile serializer"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = JobSeekerProfile
        fields = [
            'id', 'user', 'phone', 'university', 
            'graduation_year', 'experience_level', 'degree', 'field_of_study',
            'tokens_balance', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tokens_balance', 'created_at', 'updated_at']


class HRProfileSerializer(serializers.ModelSerializer):
    """HR profile serializer"""
    user = UserSerializer(read_only=True)
    designation_display = serializers.CharField(source='get_designation_display', read_only=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    approval_letter_url = serializers.SerializerMethodField()
    
    class Meta:
        model = HRProfile
        fields = [
            'id', 'user', 'company_name', 'company_email',
            'ntn_number', 'interview_date', 'approval_letter_url',
            'designation', 'designation_display',
            'approval_status', 'approval_status_display',
            'rejection_reason', 'reviewed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'designation', 'approval_status', 
            'rejection_reason', 'reviewed_at', 'created_at', 'updated_at'
        ]
    
    def get_approval_letter_url(self, obj):
        if obj.approval_letter:
            try:
                return obj.approval_letter.url
            except Exception:
                return None
        return None


# ==================== Registration Serializers ====================

class JobSeekerRegistrationSerializer(serializers.Serializer):
    """Job Seeker registration"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=255)
    
    # Optional profile fields
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    university = serializers.CharField(max_length=255, required=False, allow_blank=True)
    graduation_year = serializers.IntegerField(required=False, allow_null=True)
    experience_level = serializers.CharField(max_length=50, required=False, allow_blank=True)
    degree = serializers.CharField(max_length=255, required=False, allow_blank=True)
    field_of_study = serializers.CharField(max_length=255, required=False, allow_blank=True)
    skills = serializers.ListField(child=serializers.CharField(), required=False)
    
    def validate_email(self, value):
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()
    
    def validate_password(self, value):
        from django.core.exceptions import ValidationError as DjangoValidationError
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        skills_data = validated_data.pop('skills', [])
        
        # Extract profile fields
        profile_data = {
            'phone': validated_data.pop('phone', ''),
            'university': validated_data.pop('university', ''),
            'graduation_year': validated_data.pop('graduation_year', None),
            'experience_level': validated_data.pop('experience_level', ''),
            'degree': validated_data.pop('degree', ''),
            'field_of_study': validated_data.pop('field_of_study', ''),
        }
        
        # Create user
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            role=CustomUser.Role.JOB_SEEKER
        )
        
        # Create profile
        profile = JobSeekerProfile.objects.create(user=user, **profile_data)

        # Create skills
        for skill_name in skills_data:
            JobSeekerSkill.objects.create(user=user, name=skill_name, percentage=60)
            
        # Create education record if university is provided
        if profile_data.get('university'):
            JobSeekerEducation.objects.create(
                user=user,
                institution=profile_data['university'],
                degree='Undergraduate', # Default placeholder as degree is not collected at signup
                year=str(profile_data.get('graduation_year', '')) if profile_data.get('graduation_year') else '',
            )
        
        return user


class HRRegistrationSerializer(serializers.Serializer):
    """HR registration"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=255)
    
    # HR specific fields
    company_name = serializers.CharField(max_length=255)
    company_email = serializers.EmailField()
    ntn_number = serializers.CharField(max_length=50)
    interview_date = serializers.DateField()
    approval_letter = serializers.FileField()
    
    def validate_email(self, value):
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()
    
    def validate_password(self, value):
        from django.core.exceptions import ValidationError as DjangoValidationError
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
    
    def validate_approval_letter(self, value):
        # Validate file size (max 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size must be under 5MB.")
        
        # Validate file type
        # Be more flexible with content types as browsers might report them differently
        allowed_types = [
            'application/pdf', 
            'image/jpeg', 
            'image/png', 
            'image/jpg',
            'image/pjpeg',
            'image/x-png'
        ]
        
        # Check by content_type if available, or by extension
        import os
        ext = os.path.splitext(value.name)[1].lower()
        allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
        
        if value.content_type not in allowed_types and ext not in allowed_extensions:
            raise serializers.ValidationError("Only PDF, JPEG, and PNG files are allowed.")
        
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })
        return attrs
    
    def create(self, validated_data):
        from django.db import transaction
        
        with transaction.atomic():
            validated_data.pop('confirm_password')
            approval_letter = validated_data.pop('approval_letter')
            
            # Extract HR profile fields
            hr_data = {
                'company_name': validated_data.pop('company_name'),
                'company_email': validated_data.pop('company_email'),
                'ntn_number': validated_data.pop('ntn_number'),
                'interview_date': validated_data.pop('interview_date'),
            }
            
            # Create user
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                full_name=validated_data['full_name'],
                role=CustomUser.Role.HR
            )
            
            # Create HR profile with approval letter
            hr_profile = HRProfile.objects.create(
                user=user,
                approval_letter=approval_letter,
                **hr_data
            )
            
            return user


# ==================== Authentication Serializers ====================

class LoginSerializer(serializers.Serializer):
    """Login serializer"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=['job_seeker', 'hr', 'admin'],
        required=True
    )
    
    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        password = attrs.get('password', '')
        selected_role = attrs.get('role', '')
        
        user = authenticate(username=email, password=password)
        
        if not user:
            raise serializers.ValidationError({
                "email": "Invalid email or password."
            })
        
        if not user.is_active:
            raise serializers.ValidationError({
                "email": "This account has been deactivated."
            })
        
        # Verify the user's role matches the selected role
        if user.role != selected_role:
            raise serializers.ValidationError({
                "role": f"Invalid role selected. Please select the correct role for your account."
            })
        
        attrs['user'] = user
        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    """Google OAuth serializer"""
    token = serializers.CharField()
    role = serializers.ChoiceField(
        choices=['job_seeker', 'hr'],
        default='job_seeker'
    )


# ==================== Email Verification Serializers ====================

class VerifyEmailSerializer(serializers.Serializer):
    """Email verification OTP serializer"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    
    def validate_email(self, value):
        return value.lower()


class ResendOTPSerializer(serializers.Serializer):
    """Resend OTP serializer"""
    email = serializers.EmailField()
    
    def validate_email(self, value):
        return value.lower()


# ==================== Password Reset Serializers ====================

class ForgotPasswordSerializer(serializers.Serializer):
    """Request password reset"""
    email = serializers.EmailField()
    
    def validate_email(self, value):
        value = value.lower()
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("No account found with this email.")
        return value


class VerifyResetOTPSerializer(serializers.Serializer):
    """Verify password reset OTP"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    
    def validate_email(self, value):
        return value.lower()


class ResetPasswordSerializer(serializers.Serializer):
    """Reset password with OTP"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_email(self, value):
        return value.lower()
    
    def validate_new_password(self, value):
        validate_password(value)
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Change password (logged in user)"""
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_new_password(self, value):
        validate_password(value)
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })
        return attrs


# ==================== Admin Serializers ====================

class AdminUserListSerializer(serializers.ModelSerializer):
    """User list for admin"""
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'full_name', 'role',
            'is_email_verified', 'is_active', 
            'created_at', 'last_login', 'profile'
        ]
    
    def get_profile(self, obj):
        if obj.role == 'job_seeker':
            try:
                return JobSeekerProfileSerializer(obj.job_seeker_profile, context=self.context).data
            except:
                return None
        elif obj.role == 'hr':
            try:
                return HRProfileSerializer(obj.hr_profile, context=self.context).data
            except:
                return None
        return None


class HRApprovalSerializer(serializers.Serializer):
    """HR approval by admin"""
    designation = serializers.ChoiceField(choices=HRProfile.Designation.choices)


class HRRejectionSerializer(serializers.Serializer):
    """HR rejection by admin"""
    reason = serializers.CharField(max_length=500)


class AdminChangePasswordSerializer(serializers.Serializer):
    """Admin changing user password"""
    new_password = serializers.CharField(write_only=True, min_length=8)
    
    def validate_new_password(self, value):
        validate_password(value)
        return value


class AdminUpdateUserSerializer(serializers.Serializer):
    """Admin updating user details"""
    full_name = serializers.CharField(max_length=255, required=False)
    is_active = serializers.BooleanField(required=False)


class PlatformStatsSerializer(serializers.Serializer):
    """Platform statistics for admin dashboard"""
    total_users = serializers.IntegerField()
    total_job_seekers = serializers.IntegerField()
    total_hrs = serializers.IntegerField()
    pending_hr_approvals = serializers.IntegerField()
    verified_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    users_today = serializers.IntegerField()
    users_this_week = serializers.IntegerField()
    users_this_month = serializers.IntegerField()


# ==================== Profile Update Serializers ====================

class UpdateJobSeekerProfileSerializer(serializers.Serializer):
    """Update job seeker profile"""
    full_name = serializers.CharField(max_length=255, required=False)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    university = serializers.CharField(max_length=255, required=False, allow_blank=True)
    graduation_year = serializers.IntegerField(required=False, allow_null=True)
    degree = serializers.CharField(max_length=255, required=False, allow_blank=True)
    field_of_study = serializers.CharField(max_length=255, required=False, allow_blank=True)
    profile_picture = serializers.ImageField(required=False)


class UpdateHRProfileSerializer(serializers.Serializer):
    """Update HR profile"""
    full_name = serializers.CharField(max_length=255, required=False)
    company_name = serializers.CharField(max_length=255, required=False)
    company_email = serializers.EmailField(required=False)
    profile_picture = serializers.ImageField(required=False)
