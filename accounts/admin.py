from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, 
    JobSeekerProfile, 
    HRProfile, 
    EmailVerification,
    PasswordReset,
    TokenTransaction
)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'full_name', 'role', 'is_email_verified', 'is_active', 'created_at')
    list_filter = ('role', 'is_email_verified', 'is_active', 'is_google_user')
    search_fields = ('email', 'full_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'profile_picture')}),
        ('Role & Status', {'fields': ('role', 'is_email_verified', 'is_google_user', 'google_id')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Timestamps', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'role', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login')


@admin.register(JobSeekerProfile)
class JobSeekerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'university', 'graduation_year', 'tokens_balance', 'created_at')
    list_filter = ('graduation_year',)
    search_fields = ('user__email', 'user__full_name', 'university')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(HRProfile)
class HRProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'designation', 'approval_status', 'created_at')
    list_filter = ('approval_status', 'designation')
    search_fields = ('user__email', 'user__full_name', 'company_name', 'ntn_number')
    readonly_fields = ('created_at', 'updated_at', 'reviewed_at')
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Company Info', {'fields': ('company_name', 'company_email', 'ntn_number', 'interview_date')}),
        ('Documents', {'fields': ('approval_letter',)}),
        ('Approval', {'fields': ('approval_status', 'designation', 'rejection_reason', 'reviewed_by', 'reviewed_at')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp_code', 'is_used', 'expires_at', 'created_at')
    list_filter = ('is_used',)
    search_fields = ('user__email',)
    readonly_fields = ('created_at',)


@admin.register(PasswordReset)
class PasswordResetAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp_code', 'is_used', 'expires_at', 'created_at')
    list_filter = ('is_used',)
    search_fields = ('user__email',)
    readonly_fields = ('created_at',)


@admin.register(TokenTransaction)
class TokenTransactionAdmin(admin.ModelAdmin):
    list_display = ('job_seeker', 'transaction_type', 'amount', 'balance_after', 'created_at')
    list_filter = ('transaction_type',)
    search_fields = ('job_seeker__user__email',)
    readonly_fields = ('created_at',)