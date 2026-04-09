from rest_framework import status, generics, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.utils import timezone
from django.http import HttpResponse
from django.db.models import Q
from datetime import timedelta
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
import cloudinary
import cloudinary.api
import requests as http_requests

from .models import (
    CustomUser, 
    JobSeekerProfile, 
    HRProfile, 
    EmailVerification,
    PasswordReset,
    TokenTransaction,
    JobSeekerSkill,
    JobSeekerPortfolioItem,
    JobSeekerEducation,
    JobSeekerLanguage
)
from .serializers import (
    UserSerializer,
    JobSeekerProfileSerializer,
    HRProfileSerializer,
    JobSeekerSkillSerializer,
    JobSeekerPortfolioItemSerializer,
    JobSeekerEducationSerializer,
    JobSeekerLanguageSerializer,
    JobSeekerRegistrationSerializer,
    HRRegistrationSerializer,
    LoginSerializer,
    GoogleAuthSerializer,
    VerifyEmailSerializer,
    ResendOTPSerializer,
    ForgotPasswordSerializer,
    VerifyResetOTPSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
    AdminUserListSerializer,
    HRApprovalSerializer,
    HRRejectionSerializer,
    AdminChangePasswordSerializer,
    AdminUpdateUserSerializer,
    PlatformStatsSerializer,
    UpdateJobSeekerProfileSerializer,
    UpdateHRProfileSerializer,
)
from .permissions import (
    IsAdmin, 
    IsJobSeeker, 
    IsHR, 
    IsHRPendingOrApproved,
    IsEmailVerified,
    IsOwnerOrAdmin
)
from .utils import EmailService, OTPService

import logging

logger = logging.getLogger(__name__)


# ==================== Helper Functions ====================

def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    
    # Add custom claims
    refresh['email'] = user.email
    refresh['role'] = user.role
    refresh['full_name'] = user.full_name
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def create_verification_otp(user):
    """Create and send verification OTP"""
    print(f"DEBUG: Creating OTP for {user.email}")
    # Invalidate previous OTPs
    EmailVerification.objects.filter(user=user, is_used=False).update(is_used=True)
    
    # Generate new OTP
    otp_code = OTPService.generate_otp()
    expires_at = OTPService.get_expiry_time()
    
    otp_obj = EmailVerification.objects.create(
        user=user,
        otp_code=otp_code,
        expires_at=expires_at
    )
    print(f"DEBUG: OTP created in DB: {otp_obj.otp_code}")
    
    # Send email
    sent = EmailService.send_verification_email(user, otp_code)
    print(f"DEBUG: Email sent status: {sent}")
    
    return otp_code


# ==================== Registration Views ====================

class JobSeekerRegistrationView(APIView):
    """
    POST /api/auth/register/job-seeker/
    Register a new job seeker
    """
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, FormParser, MultiPartParser]
    
    def post(self, request):
        serializer = JobSeekerRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                user = serializer.save()
                
                # Create initial token transaction
                TokenTransaction.objects.create(
                    job_seeker=user.job_seeker_profile,
                    transaction_type=TokenTransaction.TransactionType.INITIAL,
                    amount=50,
                    balance_after=50,
                    description="Welcome bonus tokens"
                )
                
                # Send verification OTP
                create_verification_otp(user)
                
                return Response({
                    'success': True,
                    'message': 'Registration successful! Please check your email for verification code.',
                    'data': {
                        'email': user.email,
                        'full_name': user.full_name,
                        'role': user.role
                    }
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'success': False,
                    'message': 'An error occurred during registration',
                    'errors': {'non_field_errors': [str(e)]}
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Extract first error message
        errors = serializer.errors
        error_message = 'Registration failed'
        if errors:
            first_field = next(iter(errors))
            first_error = errors[first_field]
            if isinstance(first_error, list) and first_error:
                error_message = first_error[0]
        
        return Response({
            'success': False,
            'message': error_message,
            'errors': errors
        }, status=status.HTTP_400_BAD_REQUEST)


class HRRegistrationView(APIView):
    """
    POST /api/auth/register/hr/
    Register a new HR user
    """
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def post(self, request):
        print(f"DEBUG: Request Content-Type: {request.content_type}")
        print(f"DEBUG: Request FILES: {request.FILES.keys()}")
        
        serializer = HRRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                user = serializer.save()
                print(f"DEBUG: Successfully registered HR: {user.email}")
                
                # Send verification OTP
                create_verification_otp(user)
                
                return Response({
                    'success': True,
                    'message': 'Registration successful! Please check your email for verification code.',
                    'data': {
                        'email': user.email,
                        'full_name': user.full_name,
                        'role': user.role,
                        'approval_status': 'pending'
                    }
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"DEBUG: HR Registration Exception: {str(e)}")
                return Response({
                    'success': False,
                    'message': 'An error occurred during registration',
                    'errors': {'non_field_errors': [str(e)]}
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Extract first error message for better UX
        errors = serializer.errors
        error_message = 'Registration failed. Please check your details.'
        
        if errors:
            # Check for non_field_errors first
            if 'non_field_errors' in errors:
                error_message = errors['non_field_errors'][0]
            else:
                first_field = next(iter(errors))
                first_error = errors[first_field]
                field_name = first_field.replace('_', ' ').title()
                
                if isinstance(first_error, list) and first_error:
                    error_message = f"{field_name}: {first_error[0]}"
                elif isinstance(first_error, dict):
                    # Handle nested errors if any
                    first_sub_field = next(iter(first_error))
                    error_message = f"{field_name}: {first_error[first_sub_field][0]}"
        
        print(f"DEBUG: HR Registration Validation Errors: {errors}")
        return Response({
            'success': False,
            'message': error_message,
            'errors': errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== Email Verification Views ====================

class VerifyEmailView(APIView):
    """
    POST /api/auth/verify-email/
    Verify email with OTP
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            if user.is_email_verified:
                return Response({
                    'success': False,
                    'message': 'Email is already verified'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Find valid OTP
            verification = EmailVerification.objects.filter(
                user=user,
                otp_code=otp,
                is_used=False
            ).first()
            
            if not verification:
                return Response({
                    'success': False,
                    'message': 'Invalid OTP code'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if verification.is_expired:
                return Response({
                    'success': False,
                    'message': 'OTP has expired. Please request a new one.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Mark OTP as used
            verification.is_used = True
            verification.save()
            
            # Verify user email
            user.is_email_verified = True
            user.save()
            
            # Send welcome email
            EmailService.send_welcome_email(user)
            
            # If user is HR, notify admin
            if user.role == CustomUser.Role.HR:
                EmailService.send_admin_new_hr_notification(user)
            
            # Generate tokens
            tokens = get_tokens_for_user(user)
            
            message = 'Email verified successfully!'
            if user.role == CustomUser.Role.HR:
                message = 'Email verified successfully! Your profile is now under review by our admin team.'
            
            return Response({
                'success': True,
                'message': message,
                'data': {
                    'user': UserSerializer(user).data,
                    'tokens': tokens
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ResendOTPView(APIView):
    """
    POST /api/auth/resend-otp/
    Resend verification OTP
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            if user.is_email_verified:
                return Response({
                    'success': False,
                    'message': 'Email is already verified'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check rate limiting (max 3 OTPs per hour)
            recent_otps = EmailVerification.objects.filter(
                user=user,
                created_at__gte=timezone.now() - timedelta(hours=1)
            ).count()
            
            if recent_otps >= 3:
                return Response({
                    'success': False,
                    'message': 'Too many OTP requests. Please try again later.'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Send new OTP
            create_verification_otp(user)
            
            return Response({
                'success': True,
                'message': 'New verification code sent to your email.'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== Login Views ====================

class LoginView(APIView):
    """
    POST /api/auth/login/
    Login with email and password
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Check if email is verified
            if not user.is_email_verified:
                # Send new OTP
                create_verification_otp(user)
                
                return Response({
                    'success': False,
                    'message': 'Email not verified. A new verification code has been sent.',
                    'data': {
                        'email_verified': False,
                        'email': user.email
                    }
                }, status=status.HTTP_403_FORBIDDEN)
            
            # For HR, check approval status
            hr_status = None
            if user.role == 'hr':
                try:
                    hr_profile = user.hr_profile
                    hr_status = hr_profile.approval_status
                except HRProfile.DoesNotExist:
                    pass
            
            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            # Generate tokens
            tokens = get_tokens_for_user(user)
            
            # Get profile data
            profile_data = None
            if user.role == 'job_seeker':
                try:
                    profile_data = JobSeekerProfileSerializer(user.job_seeker_profile).data
                except:
                    pass
            elif user.role == 'hr':
                try:
                    profile_data = HRProfileSerializer(user.hr_profile).data
                except:
                    pass
            
            return Response({
                'success': True,
                'message': 'Login successful!',
                'data': {
                    'user': UserSerializer(user).data,
                    'profile': profile_data,
                    'tokens': tokens,
                    'hr_approval_status': hr_status
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Login failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenRefreshView(TokenRefreshView):
    """
    POST /api/auth/token/refresh/
    Refresh access token using refresh token
    """
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return Response({
                'success': True,
                'message': 'Token refreshed successfully',
                'data': response.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Invalid refresh token',
                'errors': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)



class GoogleAuthView(APIView):
    """
    POST /api/auth/google/
    Authenticate with Google OAuth
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        
        if serializer.is_valid():
            token = serializer.validated_data['token']
            role = serializer.validated_data['role']
            
            try:
                # Verify Google token
                idinfo = id_token.verify_oauth2_token(
                    token,
                    google_requests.Request(),
                    settings.GOOGLE_CLIENT_ID
                )
                
                google_id = idinfo['sub']
                email = idinfo['email']
                full_name = idinfo.get('name', email.split('@')[0])
                picture = idinfo.get('picture', None)
                
                # Check if user exists with this Google ID
                user = CustomUser.objects.filter(google_id=google_id).first()
                
                if user:
                    # Existing Google user - login
                    if not user.is_active:
                        return Response({
                            'success': False,
                            'message': 'This account has been deactivated.'
                        }, status=status.HTTP_403_FORBIDDEN)
                    
                    user.last_login = timezone.now()
                    user.save(update_fields=['last_login'])
                    
                else:
                    # Check if email exists (non-Google user)
                    existing_user = CustomUser.objects.filter(email=email).first()
                    
                    if existing_user:
                        # Link Google to existing account
                        existing_user.google_id = google_id
                        existing_user.is_google_user = True
                        existing_user.is_email_verified = True
                        existing_user.last_login = timezone.now()
                        existing_user.save()
                        user = existing_user
                    else:
                        # Create new user
                        user = CustomUser.objects.create(
                            email=email,
                            full_name=full_name,
                            google_id=google_id,
                            is_google_user=True,
                            is_email_verified=True,
                            role=role
                        )
                        user.set_unusable_password()
                        user.save()
                        
                        # Create profile based on role
                        if role == 'job_seeker':
                            profile = JobSeekerProfile.objects.create(user=user)
                            
                            # Create initial token transaction
                            TokenTransaction.objects.create(
                                job_seeker=profile,
                                transaction_type=TokenTransaction.TransactionType.INITIAL,
                                amount=50,
                                balance_after=50,
                                description="Welcome bonus tokens"
                            )
                            
                            # Send welcome email
                            EmailService.send_welcome_email(user)
                        
                        # Note: HR via Google still needs to complete profile
                        elif role == 'hr':
                            return Response({
                                'success': True,
                                'message': 'Google account linked. Please complete HR registration.',
                                'data': {
                                    'user': UserSerializer(user).data,
                                    'requires_hr_details': True,
                                    'tokens': get_tokens_for_user(user)
                                }
                            }, status=status.HTTP_200_OK)
                
                # For HR, check approval status
                hr_status = None
                if user.role == 'hr':
                    try:
                        hr_status = user.hr_profile.approval_status
                    except HRProfile.DoesNotExist:
                        return Response({
                            'success': True,
                            'message': 'Please complete HR profile details.',
                            'data': {
                                'user': UserSerializer(user).data,
                                'requires_hr_details': True,
                                'tokens': get_tokens_for_user(user)
                            }
                        }, status=status.HTTP_200_OK)
                
                tokens = get_tokens_for_user(user)
                
                # Get profile data
                profile_data = None
                if user.role == 'job_seeker':
                    try:
                        profile_data = JobSeekerProfileSerializer(user.job_seeker_profile).data
                    except:
                        pass
                elif user.role == 'hr':
                    try:
                        profile_data = HRProfileSerializer(user.hr_profile).data
                    except:
                        pass
                
                return Response({
                    'success': True,
                    'message': 'Login successful!',
                    'data': {
                        'user': UserSerializer(user).data,
                        'profile': profile_data,
                        'tokens': tokens,
                        'hr_approval_status': hr_status
                    }
                }, status=status.HTTP_200_OK)
                
            except ValueError as e:
                logger.error(f"Google token verification failed: {str(e)}")
                return Response({
                    'success': False,
                    'message': 'Invalid Google token'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class CompleteHRGoogleRegistrationView(APIView):
    """
    POST /api/auth/google/complete-hr/
    Complete HR registration for Google users
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if user.role != 'hr':
            return Response({
                'success': False,
                'message': 'This endpoint is only for HR users'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if HR profile already exists
        if hasattr(user, 'hr_profile'):
            return Response({
                'success': False,
                'message': 'HR profile already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate required fields
        required_fields = ['company_name', 'company_email', 'ntn_number', 'interview_date', 'approval_letter']
        missing_fields = [f for f in required_fields if f not in request.data and f not in request.FILES]
        
        if missing_fields:
            return Response({
                'success': False,
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create HR profile
            hr_profile = HRProfile.objects.create(
                user=user,
                company_name=request.data.get('company_name'),
                company_email=request.data.get('company_email'),
                ntn_number=request.data.get('ntn_number'),
                interview_date=request.data.get('interview_date'),
                approval_letter=request.FILES.get('approval_letter')
            )
            
            # Send welcome email
            EmailService.send_welcome_email(user)
            
            return Response({
                'success': True,
                'message': 'HR profile completed. Pending admin approval.',
                'data': {
                    'user': UserSerializer(user).data,
                    'profile': HRProfileSerializer(hr_profile).data
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"HR profile creation failed: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to create HR profile'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Logout and blacklist refresh token
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'success': True,
                'message': 'Logged out successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': True,
                'message': 'Logged out successfully'
            }, status=status.HTTP_200_OK)


# ==================== Password Reset Views ====================

class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Request password reset OTP
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = CustomUser.objects.get(email=email)
            
            # Check if user is Google-only
            if user.is_google_user and not user.has_usable_password():
                return Response({
                    'success': False,
                    'message': 'This account uses Google Sign-In. Please login with Google.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Rate limiting
            recent_resets = PasswordReset.objects.filter(
                user=user,
                created_at__gte=timezone.now() - timedelta(hours=1)
            ).count()
            
            if recent_resets >= 3:
                return Response({
                    'success': False,
                    'message': 'Too many password reset requests. Please try again later.'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Invalidate previous reset OTPs
            PasswordReset.objects.filter(user=user, is_used=False).update(is_used=True)
            
            # Generate new OTP
            otp_code = OTPService.generate_otp()
            expires_at = OTPService.get_expiry_time()
            
            PasswordReset.objects.create(
                user=user,
                otp_code=otp_code,
                expires_at=expires_at
            )
            
            # Send email
            EmailService.send_password_reset_email(user, otp_code)
            
            return Response({
                'success': True,
                'message': 'Password reset code sent to your email.'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class VerifyResetOTPView(APIView):
    """
    POST /api/auth/verify-reset-otp/
    Verify password reset OTP (without resetting password yet)
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = VerifyResetOTPSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Find valid OTP
            reset = PasswordReset.objects.filter(
                user=user,
                otp_code=otp,
                is_used=False
            ).first()
            
            if not reset:
                return Response({
                    'success': False,
                    'message': 'Invalid OTP code'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if reset.is_expired:
                return Response({
                    'success': False,
                    'message': 'OTP has expired. Please request a new one.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'success': True,
                'message': 'OTP verified. You can now reset your password.'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/
    Reset password with OTP
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']
            
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Find valid OTP
            reset = PasswordReset.objects.filter(
                user=user,
                otp_code=otp,
                is_used=False
            ).first()
            
            if not reset:
                return Response({
                    'success': False,
                    'message': 'Invalid OTP code'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if reset.is_expired:
                return Response({
                    'success': False,
                    'message': 'OTP has expired. Please request a new one.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Mark OTP as used
            reset.is_used = True
            reset.save()
            
            # Update password
            user.set_password(new_password)
            user.save()
            
            # Blacklist all existing tokens
            try:
                tokens = OutstandingToken.objects.filter(user=user)
                for token in tokens:
                    BlacklistedToken.objects.get_or_create(token=token)
            except:
                pass
            
            return Response({
                'success': True,
                'message': 'Password reset successful! Please login with your new password.'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Change password for logged in user
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Check if Google-only user
            if user.is_google_user and not user.has_usable_password():
                return Response({
                    'success': False,
                    'message': 'This account uses Google Sign-In. Cannot change password.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify current password
            if not user.check_password(serializer.validated_data['current_password']):
                return Response({
                    'success': False,
                    'message': 'Current password is incorrect'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Generate new tokens
            tokens = get_tokens_for_user(user)
            
            return Response({
                'success': True,
                'message': 'Password changed successfully!',
                'data': {
                    'tokens': tokens
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== Profile Views ====================

class CurrentUserView(APIView):
    """
    GET /api/auth/me/
    Get current user profile
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get HR approval status if applicable
        hr_status = None
        if user.role == 'hr':
            try:
                hr_status = user.hr_profile.approval_status
            except:
                pass

        # Get profile data
        profile_data = None
        if user.role == 'job_seeker':
            try:
                profile_data = JobSeekerProfileSerializer(user.job_seeker_profile).data
            except:
                pass
        elif user.role == 'hr':
            try:
                profile_data = HRProfileSerializer(user.hr_profile).data
            except:
                pass
        
        return Response({
            'success': True,
            'data': {
                'user': UserSerializer(user).data,
                'profile': profile_data,
                'hr_approval_status': hr_status
            }
        }, status=status.HTTP_200_OK)


class UpdateJobSeekerProfileView(APIView):
    """
    PUT /api/profile/job-seeker/
    Update job seeker profile
    """
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        serializer = UpdateJobSeekerProfileSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            profile, created = JobSeekerProfile.objects.get_or_create(user=user)
            
            # Update user fields
            if 'full_name' in serializer.validated_data:
                user.full_name = serializer.validated_data['full_name']
            
            if 'profile_picture' in serializer.validated_data:
                user.profile_picture = serializer.validated_data['profile_picture']
            
            user.save()
            
            # Update profile fields
            for field in ['phone', 'university', 'graduation_year', 'degree', 'field_of_study']:
                if field in serializer.validated_data:
                    val = serializer.validated_data[field]
                    # Handle empty strings for integer fields if necessary
                    if field == 'graduation_year' and val == '':
                        val = None
                    setattr(profile, field, val)
            
            profile.save()
            
            return Response({
                'success': True,
                'message': 'Profile updated successfully!',
                'data': {
                    'user': UserSerializer(user).data,
                    'profile': JobSeekerProfileSerializer(profile).data
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class UpdateHRProfileView(APIView):
    """
    PUT /api/profile/hr/
    Update HR profile (limited fields - can't change NTN, etc.)
    """
    permission_classes = [IsAuthenticated, IsHRPendingOrApproved]
    
    def put(self, request):
        serializer = UpdateHRProfileSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            profile, created = HRProfile.objects.get_or_create(user=user)
            
            # Update user fields
            if 'full_name' in serializer.validated_data:
                user.full_name = serializer.validated_data['full_name']
            
            if 'profile_picture' in serializer.validated_data:
                user.profile_picture = serializer.validated_data['profile_picture']
            
            user.save()
            
            # Update profile fields
            if 'company_name' in serializer.validated_data:
                profile.company_name = serializer.validated_data['company_name']
            
            if 'company_email' in serializer.validated_data:
                profile.company_email = serializer.validated_data['company_email']
            
            profile.save()
            
            return Response({
                'success': True,
                'message': 'Profile updated successfully!',
                'data': {
                    'user': UserSerializer(user).data,
                    'profile': HRProfileSerializer(profile).data
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class HRApprovalStatusView(APIView):
    """
    GET /api/hr/approval-status/
    Get current HR approval status
    """
    permission_classes = [IsAuthenticated, IsHRPendingOrApproved]
    
    def get(self, request):
        profile = request.user.hr_profile
        return Response({
            'success': True,
            'data': {
                'status': profile.approval_status,
                'status_display': profile.get_approval_status_display(),
                'rejection_reason': profile.rejection_reason if profile.approval_status == 'rejected' else None,
                'reviewed_at': profile.reviewed_at
            }
        }, status=status.HTTP_200_OK)


# ==================== Admin Views ====================

class AdminDashboardStatsView(APIView):
    """
    GET /api/admin/stats/
    Get platform statistics for admin dashboard
    """
    permission_classes = [IsAdmin]
    
    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=7)
        month_start = today_start - timedelta(days=30)
        
        stats = {
            'total_users': CustomUser.objects.count(),
            'total_job_seekers': CustomUser.objects.filter(role='job_seeker').count(),
            'total_hrs': CustomUser.objects.filter(role='hr').count(),
            'pending_hr_approvals': HRProfile.objects.filter(approval_status='pending').count(),
            'verified_users': CustomUser.objects.filter(is_email_verified=True).count(),
            'active_users': CustomUser.objects.filter(is_active=True).count(),
            'users_today': CustomUser.objects.filter(created_at__gte=today_start).count(),
            'users_this_week': CustomUser.objects.filter(created_at__gte=week_start).count(),
            'users_this_month': CustomUser.objects.filter(created_at__gte=month_start).count(),
        }
        
        serializer = PlatformStatsSerializer(stats)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class AdminUserListView(APIView):
    """
    GET /api/admin/users/
    List all users with search and filter
    """
    permission_classes = [IsAdmin]
    
    def get(self, request):
        role = request.query_params.get('role')
        search = request.query_params.get('search')
        
        users = CustomUser.objects.exclude(role='admin').order_by('-created_at')
        
        if role:
            users = users.filter(role=role)
        
        if search:
            users = users.filter(
                Q(email__icontains=search) | 
                Q(full_name__icontains=search)
            )
        
        serializer = AdminUserListSerializer(users, many=True, context={'request': request})
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class AdminUserDetailView(APIView):
    """
    GET /api/admin/users/<id>/
    Get detailed user info
    """
    permission_classes = [IsAdmin]
    
    def get(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
            return Response({
                'success': True,
                'data': AdminUserListSerializer(user, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AdminUpdateUserView(APIView):
    """
    PATCH /api/admin/users/<id>/update/
    Update user (deactivate/activate, change name)
    """
    permission_classes = [IsAdmin]
    
    def patch(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
            serializer = AdminUpdateUserSerializer(data=request.data)
            
            if serializer.is_valid():
                if 'full_name' in serializer.validated_data:
                    user.full_name = serializer.validated_data['full_name']
                if 'is_active' in serializer.validated_data:
                    user.is_active = serializer.validated_data['is_active']
                
                user.save()
                return Response({
                    'success': True,
                    'message': 'User updated successfully',
                    'data': AdminUserListSerializer(user).data
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except CustomUser.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AdminChangeUserPasswordView(APIView):
    """
    POST /api/admin/users/<id>/change-password/
    Force change user password
    """
    permission_classes = [IsAdmin]
    
    def post(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
            serializer = AdminChangePasswordSerializer(data=request.data)
            
            if serializer.is_valid():
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                return Response({
                    'success': True,
                    'message': 'Password changed successfully'
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except CustomUser.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AdminDeleteUserView(APIView):
    """
    DELETE /api/admin/users/<id>/delete/
    Permanently delete a user
    """
    permission_classes = [IsAdmin]
    
    def delete(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
            if user.role == 'admin':
                return Response({
                    'success': False,
                    'message': 'Cannot delete admin account'
                }, status=status.HTTP_403_FORBIDDEN)
                
            user.delete()
            return Response({
                'success': True,
                'message': 'User deleted successfully'
            }, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AdminPendingHRListView(APIView):
    """
    GET /api/admin/hr/pending/
    List all HR users waiting for approval
    """
    permission_classes = [IsAdmin]
    
    def get(self, request):
        pending_hrs = HRProfile.objects.filter(approval_status='pending').order_by('-created_at')
        serializer = HRProfileSerializer(pending_hrs, many=True, context={'request': request})
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class AdminHRDetailView(APIView):
    """
    GET /api/admin/hr/<id>/
    Get detailed HR profile info
    """
    permission_classes = [IsAdmin]
    
    def get(self, request, hr_id):
        try:
            hr = HRProfile.objects.get(id=hr_id)
            return Response({
                'success': True,
                'data': HRProfileSerializer(hr, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        except HRProfile.DoesNotExist:
            return Response({
                'success': False,
                'message': 'HR profile not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AdminApproveHRView(APIView):
    """
    POST /api/admin/hr/<id>/approve/
    Approve an HR user and assign a designation
    """
    permission_classes = [IsAdmin]
    
    def post(self, request, hr_id):
        try:
            hr = HRProfile.objects.get(id=hr_id)
            serializer = HRApprovalSerializer(data=request.data)
            
            if serializer.is_valid():
                hr.approval_status = 'approved'
                hr.designation = serializer.validated_data['designation']
                hr.reviewed_at = timezone.now()
                hr.rejection_reason = None
                hr.save()
                
                # Send approval email
                EmailService.send_hr_approval_email(hr.user, hr.get_designation_display())
                
                return Response({
                    'success': True,
                    'message': f'HR account approved as {hr.get_designation_display()}.',
                    'data': HRProfileSerializer(hr).data
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except HRProfile.DoesNotExist:
            return Response({
                'success': False,
                'message': 'HR profile not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AdminRejectHRView(APIView):
    """
    POST /api/admin/hr/<id>/reject/
    Reject an HR user application
    """
    permission_classes = [IsAdmin]
    
    def post(self, request, hr_id):
        try:
            hr = HRProfile.objects.get(id=hr_id)
            serializer = HRRejectionSerializer(data=request.data)
            
            if serializer.is_valid():
                hr.approval_status = 'rejected'
                hr.rejection_reason = serializer.validated_data['reason']
                hr.reviewed_at = timezone.now()
                hr.save()
                
                # Send rejection email
                EmailService.send_hr_rejection_email(hr.user, hr.rejection_reason)
                
                return Response({
                    'success': True,
                    'message': 'HR account application rejected.',
                    'data': HRProfileSerializer(hr).data
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except HRProfile.DoesNotExist:
            return Response({
                'success': False,
                'message': 'HR profile not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AdminUpdateHRDesignationView(APIView):
    """
    PATCH /api/admin/hr/<id>/designation/
    Change designation of an approved HR
    """
    permission_classes = [IsAdmin]
    
    def patch(self, request, hr_id):
        try:
            hr = HRProfile.objects.get(id=hr_id)
            if hr.approval_status != 'approved':
                return Response({
                    'success': False,
                    'message': 'User must be approved before changing designation'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            serializer = HRApprovalSerializer(data=request.data)
            if serializer.is_valid():
                hr.designation = serializer.validated_data['designation']
                hr.save()
                return Response({
                    'success': True,
                    'message': f'HR designation updated to {hr.get_designation_display()}.',
                    'data': HRProfileSerializer(hr).data
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except HRProfile.DoesNotExist:
            return Response({
                'success': False,
                'message': 'HR profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
class JobSeekerSkillViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsJobSeeker]
    serializer_class = JobSeekerSkillSerializer
    def get_queryset(self):
        return JobSeekerSkill.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class JobSeekerPortfolioItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsJobSeeker]
    serializer_class = JobSeekerPortfolioItemSerializer
    parser_classes = [MultiPartParser, FormParser]
    def get_queryset(self):
        return JobSeekerPortfolioItem.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class JobSeekerEducationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsJobSeeker]
    serializer_class = JobSeekerEducationSerializer
    def get_queryset(self):
        return JobSeekerEducation.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class JobSeekerLanguageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsJobSeeker]
    serializer_class = JobSeekerLanguageSerializer
    def get_queryset(self):
        return JobSeekerLanguage.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AdminHRDocumentProxyView(APIView):
    """
    GET /api/admin/hr/<hr_id>/document/
    Proxy endpoint that fetches the HR approval letter from Cloudinary
    using API credentials and streams it to the admin's browser.
    This bypasses Cloudinary's Strict Transformations / authentication restrictions.
    """
    permission_classes = [IsAdmin]

    def get(self, request, hr_id):
        try:
            hr = HRProfile.objects.get(id=hr_id)
        except HRProfile.DoesNotExist:
            return Response({'success': False, 'message': 'HR profile not found'}, status=status.HTTP_404_NOT_FOUND)

        if not hr.approval_letter:
            return Response({'success': False, 'message': 'No document uploaded'}, status=status.HTTP_404_NOT_FOUND)

        try:
            public_id = str(hr.approval_letter)

            # Configure cloudinary
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
                api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
                api_secret=settings.CLOUDINARY_STORAGE['API_SECRET']
            )

            # Find the resource type and format via Admin API
            resource_type = 'image'
            file_format = 'pdf'
            for rt in ['image', 'raw', 'video']:
                try:
                    info = cloudinary.api.resource(public_id, resource_type=rt)
                    resource_type = rt
                    file_format = info.get('format', 'pdf')
                    break
                except Exception:
                    continue

            # Use private_download_url - this generates a signed API download URL
            # that bypasses Strict Transformations restrictions
            download_url = cloudinary.utils.private_download_url(
                public_id,
                file_format,
                resource_type=resource_type,
                type='upload'
            )

            # Fetch the actual file content
            file_response = http_requests.get(download_url, timeout=30)

            if file_response.status_code != 200:
                return Response(
                    {'success': False, 'message': 'Could not fetch document from storage'},
                    status=status.HTTP_502_BAD_GATEWAY
                )

            # Determine content type
            content_type = file_response.headers.get('Content-Type', 'application/octet-stream')

            # Build the response
            response = HttpResponse(file_response.content, content_type=content_type)
            
            # Set appropriate headers for inline viewing (PDF) or download
            filename = f"approval_letter_{hr.company_name.replace(' ', '_')}"
            if 'pdf' in content_type.lower():
                response['Content-Disposition'] = f'inline; filename="{filename}.pdf"'
            elif 'image' in content_type.lower():
                ext = content_type.split('/')[-1]
                response['Content-Disposition'] = f'inline; filename="{filename}.{ext}"'
            else:
                response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            response['Content-Length'] = len(file_response.content)
            return response

        except Exception as e:
            return Response(
                {'success': False, 'message': f'Error fetching document: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
