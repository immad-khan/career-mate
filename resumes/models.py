import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import CustomUser, JobSeekerProfile, TokenTransaction


class ResumeTemplate(models.Model):
    """Pre-defined resume templates"""
    
    class Category(models.TextChoices):
        PROFESSIONAL = 'professional', 'Professional'
        MODERN = 'modern', 'Modern'
        CREATIVE = 'creative', 'Creative'
        SIMPLE = 'simple', 'Simple'
        ACADEMIC = 'academic', 'Academic'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    category = models.CharField(max_length=20, choices=Category.choices)
    description = models.TextField(blank=True)
    thumbnail = models.URLField(blank=True, null=True)
    is_premium = models.BooleanField(default=False)
    token_cost = models.PositiveIntegerField(default=0)
    primary_color = models.CharField(max_length=7, default='#6366f1')  # Hex color
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'resume_templates'
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.category})"


class Resume(models.Model):
    """Main resume model"""
    
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        COMPLETED = 'completed', 'Completed'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='resumes'
    )
    title = models.CharField(max_length=255, default='Untitled Resume')
    template = models.ForeignKey(
        ResumeTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resumes'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    primary_color = models.CharField(max_length=7, default='#6366f1')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resumes'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.full_name}"
    
    @property
    def completion_percentage(self):
        """Calculate resume completion percentage"""
        sections = {
            'personal_info': hasattr(self, 'personal_info'),
            'education': self.education.exists(),
            'experience': self.experiences.exists(),
            'skills': self.skills.exists(),
        }
        completed = sum(1 for v in sections.values() if v)
        return int((completed / len(sections)) * 100)


class PersonalInfo(models.Model):
    """Personal information section"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume = models.OneToOneField(
        Resume,
        on_delete=models.CASCADE,
        related_name='personal_info'
    )
    
    # Basic Info
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    
    # Location
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    
    # Online Presence
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    portfolio = models.URLField(blank=True)
    website = models.URLField(blank=True)
    
    # Professional Summary
    summary = models.TextField(blank=True, help_text="Professional summary or objective")
    
    # Profile Photo (optional)
    photo_url = models.URLField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resume_personal_info'
    
    def __str__(self):
        return f"Personal Info - {self.full_name}"


class Education(models.Model):
    """Education section"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='education'
    )
    
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    field_of_study = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    
    gpa = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(4)]
    )
    description = models.TextField(blank=True)
    achievements = models.TextField(blank=True, help_text="Comma-separated achievements")
    
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resume_education'
        ordering = ['order', '-end_date', '-start_date']
    
    def __str__(self):
        return f"{self.degree} at {self.institution}"


class Experience(models.Model):
    """Work experience section"""
    
    class EmploymentType(models.TextChoices):
        FULL_TIME = 'full_time', 'Full-time'
        PART_TIME = 'part_time', 'Part-time'
        CONTRACT = 'contract', 'Contract'
        INTERNSHIP = 'internship', 'Internship'
        FREELANCE = 'freelance', 'Freelance'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='experiences'
    )
    
    company = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    employment_type = models.CharField(
        max_length=20,
        choices=EmploymentType.choices,
        default=EmploymentType.FULL_TIME
    )
    location = models.CharField(max_length=255, blank=True)
    is_remote = models.BooleanField(default=False)
    
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    
    description = models.TextField(blank=True)
    responsibilities = models.TextField(blank=True, help_text="One responsibility per line")
    achievements = models.TextField(blank=True, help_text="One achievement per line")
    
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resume_experiences'
        ordering = ['order', '-end_date', '-start_date']
    
    def __str__(self):
        return f"{self.position} at {self.company}"


class Skill(models.Model):
    """Skills section"""
    
    class ProficiencyLevel(models.TextChoices):
        BEGINNER = 'beginner', 'Beginner'
        INTERMEDIATE = 'intermediate', 'Intermediate'
        ADVANCED = 'advanced', 'Advanced'
        EXPERT = 'expert', 'Expert'
    
    class SkillCategory(models.TextChoices):
        TECHNICAL = 'technical', 'Technical'
        SOFT = 'soft', 'Soft Skills'
        LANGUAGE = 'language', 'Language'
        TOOL = 'tool', 'Tools & Software'
        OTHER = 'other', 'Other'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='skills'
    )
    
    name = models.CharField(max_length=100)
    category = models.CharField(
        max_length=20,
        choices=SkillCategory.choices,
        default=SkillCategory.TECHNICAL
    )
    proficiency = models.CharField(
        max_length=20,
        choices=ProficiencyLevel.choices,
        default=ProficiencyLevel.INTERMEDIATE
    )
    years_of_experience = models.PositiveIntegerField(null=True, blank=True)
    
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resume_skills'
        ordering = ['order', 'category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.proficiency})"


class Project(models.Model):
    """Projects section"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    
    name = models.CharField(max_length=255)
    description = models.TextField()
    technologies = models.TextField(blank=True, help_text="Comma-separated technologies")
    
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_ongoing = models.BooleanField(default=False)
    
    url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    
    highlights = models.TextField(blank=True, help_text="One highlight per line")
    
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resume_projects'
        ordering = ['order', '-end_date']
    
    def __str__(self):
        return self.name


class Certification(models.Model):
    """Certifications section"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='certifications'
    )
    
    name = models.CharField(max_length=255)
    issuing_organization = models.CharField(max_length=255)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    has_no_expiry = models.BooleanField(default=False)
    
    credential_id = models.CharField(max_length=255, blank=True)
    credential_url = models.URLField(blank=True)
    
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resume_certifications'
        ordering = ['order', '-issue_date']
    
    def __str__(self):
        return f"{self.name} - {self.issuing_organization}"


class Language(models.Model):
    """Languages section"""
    
    class ProficiencyLevel(models.TextChoices):
        ELEMENTARY = 'elementary', 'Elementary'
        LIMITED = 'limited', 'Limited Working'
        PROFESSIONAL = 'professional', 'Professional Working'
        FULL_PROFESSIONAL = 'full_professional', 'Full Professional'
        NATIVE = 'native', 'Native/Bilingual'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='languages'
    )
    
    name = models.CharField(max_length=100)
    proficiency = models.CharField(
        max_length=20,
        choices=ProficiencyLevel.choices,
        default=ProficiencyLevel.PROFESSIONAL
    )
    
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resume_languages'
        ordering = ['order', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.proficiency})"


class Reference(models.Model):
    """References section"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='references'
    )
    
    name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    relationship = models.CharField(max_length=255, blank=True)
    
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resume_references'
        ordering = ['order', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.company}"


class CustomSection(models.Model):
    """Custom sections for additional information"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='custom_sections'
    )
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resume_custom_sections'
        ordering = ['order']
    
    def __str__(self):
        return self.title