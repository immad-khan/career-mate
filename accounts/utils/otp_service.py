import random
import string
from datetime import timedelta
from django.utils import timezone
from django.conf import settings


class OTPService:
    """Service for generating and validating OTPs"""
    
    @staticmethod
    def generate_otp(length=6):
        """Generate a random numeric OTP"""
        return ''.join(random.choices(string.digits, k=length))
    
    @staticmethod
    def get_expiry_time(minutes=None):
        """Get OTP expiry timestamp"""
        if minutes is None:
            minutes = getattr(settings, 'OTP_EXPIRY_MINUTES', 10)
        return timezone.now() + timedelta(minutes=minutes)
    
    @staticmethod
    def verify_otp(stored_otp, provided_otp):
        """Compare OTPs"""
        return stored_otp == provided_otp