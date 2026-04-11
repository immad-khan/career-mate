import os
import django
import sys

# Set up Django environment
sys.path.append('d:\\Desktop\\careermate')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'careermate.settings')
django.setup()

from accounts.models import CustomUser

u = CustomUser.objects.filter(email__contains='702').first()
if u:
    print(f"E:{u.email}")
    print(f"R:{u.role}")
    print(f"V:{u.is_email_verified}")
