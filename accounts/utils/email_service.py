from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails"""
    
    @staticmethod
    def send_email(to_email, subject, template_name, context):
        """Send HTML email using template"""
        try:
            # Add common context
            context['frontend_url'] = settings.FRONTEND_URL
            context['current_year'] = 2025
            
            # Render HTML template
            html_content = render_to_string(f'emails/{template_name}', context)
            text_content = strip_tags(html_content)
            
            # Create email
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[to_email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    @classmethod
    def send_verification_email(cls, user, otp_code):
        """Send email verification OTP"""
        context = {
            'user_name': user.full_name,
            'otp_code': otp_code,
            'expiry_minutes': settings.OTP_EXPIRY_MINUTES
        }
        return cls.send_email(
            to_email=user.email,
            subject='Verify Your CareerMate Account',
            template_name='verification_email.html',
            context=context
        )
    
    @classmethod
    def send_password_reset_email(cls, user, otp_code):
        """Send password reset OTP"""
        context = {
            'user_name': user.full_name,
            'otp_code': otp_code,
            'expiry_minutes': settings.OTP_EXPIRY_MINUTES
        }
        return cls.send_email(
            to_email=user.email,
            subject='Reset Your CareerMate Password',
            template_name='password_reset_email.html',
            context=context
        )
    
    @classmethod
    def send_hr_approval_email(cls, user, designation):
        """Send HR approval notification"""
        context = {
            'user_name': user.full_name,
            'designation': designation
        }
        return cls.send_email(
            to_email=user.email,
            subject='Your CareerMate HR Account Has Been Approved!',
            template_name='hr_approval_email.html',
            context=context
        )
    
    @classmethod
    def send_hr_rejection_email(cls, user, reason):
        """Send HR rejection notification"""
        context = {
            'user_name': user.full_name,
            'rejection_reason': reason
        }
        return cls.send_email(
            to_email=user.email,
            subject='Update on Your CareerMate HR Application',
            template_name='hr_rejection_email.html',
            context=context
        )
    
    @classmethod
    def send_admin_new_hr_notification(cls, hr_user):
        """Notify admin about new HR registration"""
        from accounts.models import CustomUser
        from django.utils import timezone
        
        # Get all admin users
        admins = CustomUser.objects.filter(role=CustomUser.Role.ADMIN)
        if not admins.exists():
            logger.warning("No admin users found to notify about new HR registration")
            return False
        
        hr_profile = getattr(hr_user, 'hr_profile', None)
        company_name = hr_profile.company_name if hr_profile else "N/A"
        
        context = {
            'hr_name': hr_user.full_name,
            'hr_email': hr_user.email,
            'company_name': company_name,
            'registration_date': timezone.now().strftime('%Y-%m-%d %H:%M')
        }
        
        success = True
        for admin in admins:
            if not cls.send_email(
                to_email=admin.email,
                subject=f'New HR Registration: {hr_user.full_name}',
                template_name='admin_hr_notification.html',
                context=context
            ):
                success = False
        
        return success

    @classmethod
    def send_welcome_email(cls, user):
        """Send welcome email after verification"""
        context = {
            'user_name': user.full_name,
            'is_hr': user.role == 'hr'
        }
        return cls.send_email(
            to_email=user.email,
            subject='Welcome to CareerMate!',
            template_name='welcome_email.html',
            context=context
        )

    @classmethod
    def send_application_approved_email(cls, user, job_title, company_name, hr_name, hr_message=None):
        """Send application accepted / congratulations email"""
        context = {
            'user_name': user.full_name,
            'job_title': job_title,
            'company_name': company_name,
            'hr_name': hr_name,
            'hr_message': hr_message or '',
        }
        return cls.send_email(
            to_email=user.email,
            subject=f'Congratulations! You\'ve been hired for {job_title} at {company_name}',
            template_name='application_approved_email.html',
            context=context
        )

    @classmethod
    def send_application_rejected_email(cls, user, job_title, company_name, hr_name, hr_message=None):
        """Send application rejection email"""
        context = {
            'user_name': user.full_name,
            'job_title': job_title,
            'company_name': company_name,
            'hr_name': hr_name,
            'hr_message': hr_message or '',
        }
        return cls.send_email(
            to_email=user.email,
            subject=f'Application Update - {job_title} at {company_name}',
            template_name='application_rejected_email.html',
            context=context
        )