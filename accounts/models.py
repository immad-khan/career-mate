import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from cloudinary.models import CloudinaryField


class CustomUserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_email_verified', True)
        extra_fields.setdefault('role', 'admin')
        
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """Custom User Model with email as username"""
    
    class Role(models.TextChoices):
        JOB_SEEKER = 'job_seeker', 'Job Seeker'
        HR = 'hr', 'HR'
        ADMIN = 'admin', 'Admin'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.JOB_SEEKER)
    
    # Profile picture stored on Cloudinary
    profile_picture = CloudinaryField('profile_pictures', blank=True, null=True)
    
    # Status fields
    is_email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Google OAuth
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    is_google_user = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(blank=True, null=True)
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} ({self.email})"
    
    @property
    def is_job_seeker(self):
        return self.role == self.Role.JOB_SEEKER
    
    @property
    def is_hr(self):
        return self.role == self.Role.HR
    
    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN


class JobSeekerProfile(models.Model):
    """Extended profile for Job Seekers"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='job_seeker_profile'
    )
    
    # Contact & Education
    phone = models.CharField(max_length=20, blank=True, null=True)
    university = models.CharField(max_length=255, blank=True, null=True)
    graduation_year = models.PositiveIntegerField(blank=True, null=True)
    experience_level = models.CharField(max_length=50, blank=True, null=True)
    degree = models.CharField(max_length=255, blank=True, null=True)
    field_of_study = models.CharField(max_length=255, blank=True, null=True)
    
    # Token System
    tokens_balance = models.PositiveIntegerField(default=50)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'job_seeker_profiles'
        verbose_name = 'Job Seeker Profile'
        verbose_name_plural = 'Job Seeker Profiles'
    
    def __str__(self):
        return f"JobSeeker: {self.user.full_name}"
    
    def deduct_tokens(self, amount):
        """Deduct tokens for premium features"""
        if self.tokens_balance >= amount:
            self.tokens_balance -= amount
            self.save()
            return True
        return False
    
    def add_tokens(self, amount):
        """Add tokens (after purchase)"""
        self.tokens_balance += amount
        self.save()


class HRProfile(models.Model):
    """Extended profile for HR/Employers"""
    
    class ApprovalStatus(models.TextChoices):
        PENDING = 'pending', 'Pending Approval'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
    
    class Designation(models.TextChoices):
        JUNIOR_HR_EXECUTIVE = 'junior_hr_executive', 'Junior HR Executive'
        SENIOR_HR_EXECUTIVE = 'senior_hr_executive', 'Senior HR Executive'
        HR_MANAGER = 'hr_manager', 'HR Manager'
        TALENT_ACQUISITION = 'talent_acquisition', 'Talent Acquisition Specialist'
        RECRUITMENT_LEAD = 'recruitment_lead', 'Recruitment Lead'
        HR_DIRECTOR = 'hr_director', 'HR Director'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='hr_profile'
    )
    
    # Company Information
    company_name = models.CharField(max_length=255)
    company_email = models.EmailField()
    ntn_number = models.CharField(max_length=50, help_text="National Tax Number")
    
    # Interview Experience (Date when they conducted interview)
    interview_date = models.DateField(
        help_text="Date when you last conducted an interview"
    )
    
    # Approval Letter - Stored on Cloudinary
    approval_letter = CloudinaryField('approval_letters', resource_type='auto')
    
    # Designation - Assigned by Admin
    designation = models.CharField(
        max_length=50, 
        choices=Designation.choices, 
        blank=True, 
        null=True
    )
    
    # Approval Status
    approval_status = models.CharField(
        max_length=20, 
        choices=ApprovalStatus.choices, 
        default=ApprovalStatus.PENDING
    )
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Admin who approved/rejected
    reviewed_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='reviewed_hrs'
    )
    reviewed_at = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'hr_profiles'
        verbose_name = 'HR Profile'
        verbose_name_plural = 'HR Profiles'
    
    def __str__(self):
        return f"HR: {self.user.full_name} - {self.company_name}"
    
    @property
    def is_approved(self):
        return self.approval_status == self.ApprovalStatus.APPROVED
    
    @property
    def is_pending(self):
        return self.approval_status == self.ApprovalStatus.PENDING


class EmailVerification(models.Model):
    """OTP for email verification"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='email_verifications'
    )
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'email_verifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP for {self.user.email}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired


class PasswordReset(models.Model):
    """OTP for password reset"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='password_resets'
    )
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'password_resets'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Password Reset for {self.user.email}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired


class TokenTransaction(models.Model):
    """Track token usage and purchases"""
    
    class TransactionType(models.TextChoices):
        INITIAL = 'initial', 'Initial Balance'
        PURCHASE = 'purchase', 'Purchase'
        RESUME = 'resume', 'Resume Generation'
        COVER_LETTER = 'cover_letter', 'Cover Letter Generation'
        COLD_EMAIL = 'cold_email', 'Cold Email Generation'
        SKILLBOT = 'skillbot', 'SkillBot Query'
        MOCK_INTERVIEW = 'mock_interview', 'Mock Interview'
        FUTURE_TRENDS = 'future_trends', 'Future Trends Query'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_seeker = models.ForeignKey(
        JobSeekerProfile, 
        on_delete=models.CASCADE, 
        related_name='token_transactions'
    )
    transaction_type = models.CharField(max_length=30, choices=TransactionType.choices)
    amount = models.IntegerField()  # Positive for credit, negative for debit
    balance_after = models.PositiveIntegerField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'token_transactions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.job_seeker.user.email}: {self.transaction_type} ({self.amount})"
class JobSeekerSkill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    percentage = models.PositiveIntegerField(default=50)
    class Meta:
        db_table = 'job_seeker_skills'
        ordering = ['id']
    def __str__(self):
        return f"{self.user.full_name} - {self.name} ({self.percentage}%)"

class JobSeekerPortfolioItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='portfolio_items')
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = CloudinaryField('portfolio_images', blank=True, null=True)
    link = models.URLField(blank=True, null=True)
    technologies = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        db_table = 'job_seeker_portfolio'
        ordering = ['-id']
    def __str__(self):
        return f"{self.user.full_name} - {self.title}"

class JobSeekerEducation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='education_entries')
    degree = models.CharField(max_length=255)
    institution = models.CharField(max_length=255)
    year = models.CharField(max_length=50, blank=True, null=True)
    field_of_study = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.CharField(max_length=50, blank=True, null=True)
    end_date = models.CharField(max_length=50, blank=True, null=True)
    is_current = models.BooleanField(default=False)
    class Meta:
        db_table = 'job_seeker_education'
        ordering = ['id']
    def __str__(self):
        return f"{self.user.full_name} - {self.degree}"

class JobSeekerLanguage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='languages')
    name = models.CharField(max_length=100)
    proficiency_percentage = models.PositiveIntegerField(default=50)
    class Meta:
        db_table = 'job_seeker_languages'
        ordering = ['id']
    def __str__(self):
        return f"{self.user.full_name} - {self.name}"
