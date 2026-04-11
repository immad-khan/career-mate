import os
import django
import sys

# Set up Django environment
sys.path.append('d:\\Desktop\\careermate')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'careermate.settings')
django.setup()

from accounts.models import HRProfile, CustomUser

print(f"Total Users: {CustomUser.objects.count()}")
print(f"HR Profiles: {HRProfile.objects.count()}")
print(f"Pending HRs: {HRProfile.objects.filter(approval_status='pending').count()}")

for hr in HRProfile.objects.filter(approval_status='pending'):
    print(f"Pending HR: {hr.user.email} - {hr.company_name}")
