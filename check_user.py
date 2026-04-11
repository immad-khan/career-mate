import os
import django
import sys

# Set up Django environment
sys.path.append('d:\\Desktop\\careermate')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'careermate.settings')
django.setup()

from accounts.models import HRProfile, CustomUser

email = 'immadonline702@gmail.com'
user = CustomUser.objects.filter(email=email).first()
if user:
    print(f"User found: {user.email}, Role: {user.role}")
    hr = HRProfile.objects.filter(user=user).first()
    if hr:
        print(f"HR Profile found: {hr.company_name}, Status: {hr.approval_status}")
    else:
        print("No HR profile for this user.")
else:
    print("User not found in DB.")
