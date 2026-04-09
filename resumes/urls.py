from django.urls import path
from . import views

urlpatterns = [
    # Templates
    path('templates/', views.ResumeTemplateListView.as_view(), name='resume-templates'),
    
    # Resume CRUD
    path('', views.ResumeListCreateView.as_view(), name='resume-list-create'),
    path('<uuid:resume_id>/', views.ResumeDetailView.as_view(), name='resume-detail'),
    path('<uuid:resume_id>/duplicate/', views.ResumeDuplicateView.as_view(), name='resume-duplicate'),
    
    # Personal Info
    path('<uuid:resume_id>/personal-info/', views.PersonalInfoView.as_view(), name='resume-personal-info'),
    
    # Education
    path('<uuid:resume_id>/education/', views.EducationListCreateView.as_view(), name='resume-education-list'),
    path('<uuid:resume_id>/education/<uuid:item_id>/', views.EducationDetailView.as_view(), name='resume-education-detail'),
    
    # Experience
    path('<uuid:resume_id>/experiences/', views.ExperienceListCreateView.as_view(), name='resume-experience-list'),
    path('<uuid:resume_id>/experiences/<uuid:item_id>/', views.ExperienceDetailView.as_view(), name='resume-experience-detail'),
    
    # Skills
    path('<uuid:resume_id>/skills/', views.SkillListCreateView.as_view(), name='resume-skill-list'),
    path('<uuid:resume_id>/skills/bulk/', views.BulkSkillCreateView.as_view(), name='resume-skill-bulk'),
    path('<uuid:resume_id>/skills/<uuid:item_id>/', views.SkillDetailView.as_view(), name='resume-skill-detail'),
    
    # Projects
    path('<uuid:resume_id>/projects/', views.ProjectListCreateView.as_view(), name='resume-project-list'),
    path('<uuid:resume_id>/projects/<uuid:item_id>/', views.ProjectDetailView.as_view(), name='resume-project-detail'),
    
    # Certifications
    path('<uuid:resume_id>/certifications/', views.CertificationListCreateView.as_view(), name='resume-certification-list'),
    path('<uuid:resume_id>/certifications/<uuid:item_id>/', views.CertificationDetailView.as_view(), name='resume-certification-detail'),
    
    # Languages
    path('<uuid:resume_id>/languages/', views.LanguageListCreateView.as_view(), name='resume-language-list'),
    path('<uuid:resume_id>/languages/<uuid:item_id>/', views.LanguageDetailView.as_view(), name='resume-language-detail'),
    
    # References
    path('<uuid:resume_id>/references/', views.ReferenceListCreateView.as_view(), name='resume-reference-list'),
    path('<uuid:resume_id>/references/<uuid:item_id>/', views.ReferenceDetailView.as_view(), name='resume-reference-detail'),
    
    # Custom Sections
    path('<uuid:resume_id>/custom-sections/', views.CustomSectionListCreateView.as_view(), name='resume-custom-section-list'),
    path('<uuid:resume_id>/custom-sections/<uuid:item_id>/', views.CustomSectionDetailView.as_view(), name='resume-custom-section-detail'),
    
    # Reorder
    path('<uuid:resume_id>/<str:section>/reorder/', views.ReorderSectionView.as_view(), name='resume-section-reorder'),
]