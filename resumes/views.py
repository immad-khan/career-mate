from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction

from accounts.permissions import IsJobSeeker
from accounts.models import JobSeekerProfile, TokenTransaction

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
from .serializers import (
    ResumeTemplateSerializer,
    ResumeListSerializer,
    ResumeDetailSerializer,
    ResumeCreateSerializer,
    ResumeUpdateSerializer,
    PersonalInfoSerializer,
    EducationSerializer,
    ExperienceSerializer,
    SkillSerializer,
    ProjectSerializer,
    CertificationSerializer,
    LanguageSerializer,
    ReferenceSerializer,
    CustomSectionSerializer,
    BulkSkillSerializer,
    ReorderItemsSerializer,
)

import logging

logger = logging.getLogger(__name__)


# ==================== TEMPLATE VIEWS ====================

class ResumeTemplateListView(APIView):
    """
    GET /api/resumes/templates/
    List all available resume templates
    """
    permission_classes = [IsAuthenticated, IsJobSeeker]
    
    def get(self, request):
        templates = ResumeTemplate.objects.filter(is_active=True)
        serializer = ResumeTemplateSerializer(templates, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)


# ==================== RESUME CRUD VIEWS ====================

class ResumeListCreateView(APIView):
    """
    GET /api/resumes/
    POST /api/resumes/
    """
    permission_classes = [IsAuthenticated, IsJobSeeker]
    
    def get(self, request):
        """List all resumes for current user"""
        resumes = Resume.objects.filter(user=request.user).select_related('template')
        serializer = ResumeListSerializer(resumes, many=True)
        
        return Response({
            'success': True,
            'data': {
                'count': resumes.count(),
                'resumes': serializer.data
            }
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create new resume"""
        serializer = ResumeCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            resume = serializer.save()
            
            # Auto-fill personal info from user profile
            try:
                profile = request.user.job_seeker_profile
                PersonalInfo.objects.create(
                    resume=resume,
                    full_name=request.user.full_name,
                    email=request.user.email,
                    phone=profile.phone or '',
                )
            except JobSeekerProfile.DoesNotExist:
                PersonalInfo.objects.create(
                    resume=resume,
                    full_name=request.user.full_name,
                    email=request.user.email,
                )
            
            return Response({
                'success': True,
                'message': 'Resume created successfully',
                'data': ResumeDetailSerializer(resume).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ResumeDetailView(APIView):
    """
    GET /api/resumes/<resume_id>/
    PUT /api/resumes/<resume_id>/
    DELETE /api/resumes/<resume_id>/
    """
    permission_classes = [IsAuthenticated, IsJobSeeker]
    
    def get_resume(self, resume_id, user):
        return get_object_or_404(Resume, id=resume_id, user=user)
    
    def get(self, request, resume_id):
        """Get resume details"""
        resume = self.get_resume(resume_id, request.user)
        serializer = ResumeDetailSerializer(resume)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    def put(self, request, resume_id):
        """Update resume"""
        resume = self.get_resume(resume_id, request.user)
        serializer = ResumeUpdateSerializer(resume, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Resume updated successfully',
                'data': ResumeDetailSerializer(resume).data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, resume_id):
        """Delete resume"""
        resume = self.get_resume(resume_id, request.user)
        resume.delete()
        
        return Response({
            'success': True,
            'message': 'Resume deleted successfully'
        }, status=status.HTTP_200_OK)


class ResumeDuplicateView(APIView):
    """
    POST /api/resumes/<resume_id>/duplicate/
    Duplicate a resume
    """
    permission_classes = [IsAuthenticated, IsJobSeeker]
    
    def post(self, request, resume_id):
        original = get_object_or_404(Resume, id=resume_id, user=request.user)
        
        with transaction.atomic():
            # Create new resume
            new_resume = Resume.objects.create(
                user=request.user,
                title=f"{original.title} (Copy)",
                template=original.template,
                primary_color=original.primary_color,
            )
            
            # Copy personal info
            if hasattr(original, 'personal_info'):
                pi = original.personal_info
                PersonalInfo.objects.create(
                    resume=new_resume,
                    full_name=pi.full_name,
                    email=pi.email,
                    phone=pi.phone,
                    address=pi.address,
                    city=pi.city,
                    state=pi.state,
                    country=pi.country,
                    zip_code=pi.zip_code,
                    linkedin=pi.linkedin,
                    github=pi.github,
                    portfolio=pi.portfolio,
                    website=pi.website,
                    summary=pi.summary,
                    photo_url=pi.photo_url,
                )
            
            # Copy education
            for edu in original.education.all():
                Education.objects.create(
                    resume=new_resume,
                    institution=edu.institution,
                    degree=edu.degree,
                    field_of_study=edu.field_of_study,
                    location=edu.location,
                    start_date=edu.start_date,
                    end_date=edu.end_date,
                    is_current=edu.is_current,
                    gpa=edu.gpa,
                    description=edu.description,
                    achievements=edu.achievements,
                    order=edu.order,
                )
            
            # Copy experiences
            for exp in original.experiences.all():
                Experience.objects.create(
                    resume=new_resume,
                    company=exp.company,
                    position=exp.position,
                    employment_type=exp.employment_type,
                    location=exp.location,
                    is_remote=exp.is_remote,
                    start_date=exp.start_date,
                    end_date=exp.end_date,
                    is_current=exp.is_current,
                    description=exp.description,
                    responsibilities=exp.responsibilities,
                    achievements=exp.achievements,
                    order=exp.order,
                )
            
            # Copy skills
            for skill in original.skills.all():
                Skill.objects.create(
                    resume=new_resume,
                    name=skill.name,
                    category=skill.category,
                    proficiency=skill.proficiency,
                    years_of_experience=skill.years_of_experience,
                    order=skill.order,
                )
            
            # Copy projects
            for proj in original.projects.all():
                Project.objects.create(
                    resume=new_resume,
                    name=proj.name,
                    description=proj.description,
                    technologies=proj.technologies,
                    start_date=proj.start_date,
                    end_date=proj.end_date,
                    is_ongoing=proj.is_ongoing,
                    url=proj.url,
                    github_url=proj.github_url,
                    highlights=proj.highlights,
                    order=proj.order,
                )
            
            # Copy certifications
            for cert in original.certifications.all():
                Certification.objects.create(
                    resume=new_resume,
                    name=cert.name,
                    issuing_organization=cert.issuing_organization,
                    issue_date=cert.issue_date,
                    expiry_date=cert.expiry_date,
                    has_no_expiry=cert.has_no_expiry,
                    credential_id=cert.credential_id,
                    credential_url=cert.credential_url,
                    order=cert.order,
                )
            
            # Copy languages
            for lang in original.languages.all():
                Language.objects.create(
                    resume=new_resume,
                    name=lang.name,
                    proficiency=lang.proficiency,
                    order=lang.order,
                )
            
            # Copy references
            for ref in original.references.all():
                Reference.objects.create(
                    resume=new_resume,
                    name=ref.name,
                    position=ref.position,
                    company=ref.company,
                    email=ref.email,
                    phone=ref.phone,
                    relationship=ref.relationship,
                    order=ref.order,
                )
            
            # Copy custom sections
            for cs in original.custom_sections.all():
                CustomSection.objects.create(
                    resume=new_resume,
                    title=cs.title,
                    content=cs.content,
                    order=cs.order,
                )
        
        return Response({
            'success': True,
            'message': 'Resume duplicated successfully',
            'data': ResumeDetailSerializer(new_resume).data
        }, status=status.HTTP_201_CREATED)


# ==================== SECTION VIEWS ====================

class PersonalInfoView(APIView):
    """
    GET /api/resumes/<resume_id>/personal-info/
    PUT /api/resumes/<resume_id>/personal-info/
    """
    permission_classes = [IsAuthenticated, IsJobSeeker]
    
    def get_resume(self, resume_id, user):
        return get_object_or_404(Resume, id=resume_id, user=user)
    
    def get(self, request, resume_id):
        resume = self.get_resume(resume_id, request.user)
        try:
            serializer = PersonalInfoSerializer(resume.personal_info)
            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except PersonalInfo.DoesNotExist:
            return Response({
                'success': True,
                'data': None
            }, status=status.HTTP_200_OK)
    
    def put(self, request, resume_id):
        resume = self.get_resume(resume_id, request.user)
        
        try:
            personal_info = resume.personal_info
            serializer = PersonalInfoSerializer(personal_info, data=request.data, partial=True)
        except PersonalInfo.DoesNotExist:
            serializer = PersonalInfoSerializer(data=request.data)
        
        if serializer.is_valid():
            if hasattr(resume, 'personal_info'):
                serializer.save()
            else:
                serializer.save(resume=resume)
            
            return Response({
                'success': True,
                'message': 'Personal info updated successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== GENERIC SECTION CRUD VIEW ====================

class SectionListCreateView(APIView):
    """Generic view for section list/create operations"""
    permission_classes = [IsAuthenticated, IsJobSeeker]
    model = None
    serializer_class = None
    related_name = None
    
    def get_resume(self, resume_id, user):
        return get_object_or_404(Resume, id=resume_id, user=user)
    
    def get(self, request, resume_id):
        resume = self.get_resume(resume_id, request.user)
        items = getattr(resume, self.related_name).all()
        serializer = self.serializer_class(items, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    def post(self, request, resume_id):
        resume = self.get_resume(resume_id, request.user)
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            serializer.save(resume=resume)
            return Response({
                'success': True,
                'message': 'Item added successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class SectionDetailView(APIView):
    """Generic view for section detail operations"""
    permission_classes = [IsAuthenticated, IsJobSeeker]
    model = None
    serializer_class = None
    
    def get_item(self, resume_id, item_id, user):
        resume = get_object_or_404(Resume, id=resume_id, user=user)
        return get_object_or_404(self.model, id=item_id, resume=resume)
    
    def get(self, request, resume_id, item_id):
        item = self.get_item(resume_id, item_id, request.user)
        serializer = self.serializer_class(item)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    def put(self, request, resume_id, item_id):
        item = self.get_item(resume_id, item_id, request.user)
        serializer = self.serializer_class(item, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Item updated successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, resume_id, item_id):
        item = self.get_item(resume_id, item_id, request.user)
        item.delete()
        
        return Response({
            'success': True,
            'message': 'Item deleted successfully'
        }, status=status.HTTP_200_OK)


# Education Views
class EducationListCreateView(SectionListCreateView):
    model = Education
    serializer_class = EducationSerializer
    related_name = 'education'


class EducationDetailView(SectionDetailView):
    model = Education
    serializer_class = EducationSerializer


# Experience Views
class ExperienceListCreateView(SectionListCreateView):
    model = Experience
    serializer_class = ExperienceSerializer
    related_name = 'experiences'


class ExperienceDetailView(SectionDetailView):
    model = Experience
    serializer_class = ExperienceSerializer


# Skill Views
class SkillListCreateView(SectionListCreateView):
    model = Skill
    serializer_class = SkillSerializer
    related_name = 'skills'


class SkillDetailView(SectionDetailView):
    model = Skill
    serializer_class = SkillSerializer


class BulkSkillCreateView(APIView):
    """
    POST /api/resumes/<resume_id>/skills/bulk/
    Add multiple skills at once
    """
    permission_classes = [IsAuthenticated, IsJobSeeker]
    
    def post(self, request, resume_id):
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
        serializer = BulkSkillSerializer(data=request.data)
        
        if serializer.is_valid():
            skills_data = serializer.validated_data
            created_skills = []
            
            for skill_name in skills_data['skills']:
                skill, created = Skill.objects.get_or_create(
                    resume=resume,
                    name=skill_name,
                    defaults={
                        'category': skills_data['category'],
                        'proficiency': skills_data['proficiency'],
                    }
                )
                if created:
                    created_skills.append(skill)
            
            return Response({
                'success': True,
                'message': f'{len(created_skills)} skills added successfully',
                'data': SkillSerializer(created_skills, many=True).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# Project Views
class ProjectListCreateView(SectionListCreateView):
    model = Project
    serializer_class = ProjectSerializer
    related_name = 'projects'


class ProjectDetailView(SectionDetailView):
    model = Project
    serializer_class = ProjectSerializer


# Certification Views
class CertificationListCreateView(SectionListCreateView):
    model = Certification
    serializer_class = CertificationSerializer
    related_name = 'certifications'


class CertificationDetailView(SectionDetailView):
    model = Certification
    serializer_class = CertificationSerializer


# Language Views
class LanguageListCreateView(SectionListCreateView):
    model = Language
    serializer_class = LanguageSerializer
    related_name = 'languages'


class LanguageDetailView(SectionDetailView):
    model = Language
    serializer_class = LanguageSerializer


# Reference Views
class ReferenceListCreateView(SectionListCreateView):
    model = Reference
    serializer_class = ReferenceSerializer
    related_name = 'references'


class ReferenceDetailView(SectionDetailView):
    model = Reference
    serializer_class = ReferenceSerializer


# Custom Section Views
class CustomSectionListCreateView(SectionListCreateView):
    model = CustomSection
    serializer_class = CustomSectionSerializer
    related_name = 'custom_sections'


class CustomSectionDetailView(SectionDetailView):
    model = CustomSection
    serializer_class = CustomSectionSerializer


# ==================== REORDER VIEW ====================

class ReorderSectionView(APIView):
    """
    POST /api/resumes/<resume_id>/<section>/reorder/
    Reorder items in a section
    """
    permission_classes = [IsAuthenticated, IsJobSeeker]
    
    SECTION_MODELS = {
        'education': Education,
        'experiences': Experience,
        'skills': Skill,
        'projects': Project,
        'certifications': Certification,
        'languages': Language,
        'references': Reference,
        'custom_sections': CustomSection,
    }
    
    def post(self, request, resume_id, section):
        if section not in self.SECTION_MODELS:
            return Response({
                'success': False,
                'message': f'Invalid section: {section}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
        model = self.SECTION_MODELS[section]
        
        serializer = ReorderItemsSerializer(data=request.data)
        if serializer.is_valid():
            items = serializer.validated_data['items']
            
            with transaction.atomic():
                for item_data in items:
                    item_id = item_data.get('id')
                    order = item_data.get('order')
                    if item_id and order is not None:
                        model.objects.filter(
                            id=item_id,
                            resume=resume
                        ).update(order=int(order))
            
            return Response({
                'success': True,
                'message': 'Items reordered successfully'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)