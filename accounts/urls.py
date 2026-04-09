from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profile/skills', views.JobSeekerSkillViewSet, basename='jobseeker-skills')
router.register(r'profile/portfolio', views.JobSeekerPortfolioItemViewSet, basename='jobseeker-portfolio')
router.register(r'profile/education', views.JobSeekerEducationViewSet, basename='jobseeker-education')
router.register(r'profile/languages', views.JobSeekerLanguageViewSet, basename='jobseeker-languages')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # ==================== Authentication ====================
    # Registration
    path('auth/register/job-seeker/', views.JobSeekerRegistrationView.as_view(), name='register-job-seeker'),
    path('auth/register/hr/', views.HRRegistrationView.as_view(), name='register-hr'),
    
    # Email Verification
    path('auth/verify-email/', views.VerifyEmailView.as_view(), name='verify-email'),
    path('auth/resend-otp/', views.ResendOTPView.as_view(), name='resend-otp'),
    
    # Login/Logout
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    
    # Google OAuth
    path('auth/google/', views.GoogleAuthView.as_view(), name='google-auth'),
    path('auth/google/complete-hr/', views.CompleteHRGoogleRegistrationView.as_view(), name='google-complete-hr'),
    
    # Token Refresh
    path('auth/token/refresh/', views.CustomTokenRefreshView.as_view(), name='token-refresh'),
    
    # Password Management
    path('auth/forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/verify-reset-otp/', views.VerifyResetOTPView.as_view(), name='verify-reset-otp'),
    path('auth/reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    
    # Current User
    path('auth/me/', views.CurrentUserView.as_view(), name='current-user'),
    
    # ==================== Profile ====================
    path('profile/job-seeker/', views.UpdateJobSeekerProfileView.as_view(), name='update-job-seeker-profile'),
    path('profile/hr/', views.UpdateHRProfileView.as_view(), name='update-hr-profile'),
    
    # HR Specific
    path('hr/approval-status/', views.HRApprovalStatusView.as_view(), name='hr-approval-status'),
    
    # ==================== Admin ====================
    # Dashboard
    path('admin/stats/', views.AdminDashboardStatsView.as_view(), name='admin-stats'),
    
    # User Management
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<uuid:user_id>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<uuid:user_id>/update/', views.AdminUpdateUserView.as_view(), name='admin-update-user'),
    path('admin/users/<uuid:user_id>/change-password/', views.AdminChangeUserPasswordView.as_view(), name='admin-change-user-password'),
    path('admin/users/<uuid:user_id>/delete/', views.AdminDeleteUserView.as_view(), name='admin-delete-user'),
    
    # HR Management
    path('admin/hr/pending/', views.AdminPendingHRListView.as_view(), name='admin-pending-hr-list'),
    path('admin/hr/<uuid:hr_id>/', views.AdminHRDetailView.as_view(), name='admin-hr-detail'),
    path('admin/hr/<uuid:hr_id>/approve/', views.AdminApproveHRView.as_view(), name='admin-approve-hr'),
    path('admin/hr/<uuid:hr_id>/reject/', views.AdminRejectHRView.as_view(), name='admin-reject-hr'),
    path('admin/hr/<uuid:hr_id>/designation/', views.AdminUpdateHRDesignationView.as_view(), name='admin-update-hr-designation'),
    path('admin/hr/<uuid:hr_id>/document/', views.AdminHRDocumentProxyView.as_view(), name='admin-hr-document-proxy'),
]