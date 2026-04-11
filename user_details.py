import os
import django
import sys

# Set up Django environment
sys.path.append('d:\\Desktop\\careermate')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'careermate.settings')
django.setup()

from accounts.models import CustomUser

print("--- Start ---")
u = CustomUser.objects.filter(email__contains='702').first()
if u:
    print(f"EMAIL: {u.email}")
    print(f"ROLE: {u.role}")
    print(f"CREATED: {u.created_at}")
    print(f"IS_ACTIVE: {u.is_active}")
    print(f"IS_VERIFIED: {u.is_email_verified}")
print("--- End ---")
