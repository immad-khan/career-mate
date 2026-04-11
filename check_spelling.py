import os
import django
import sys

# Set up Django environment
sys.path.append('d:\\Desktop\\careermate')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'careermate.settings')
django.setup()

from accounts.models import CustomUser

print("--- Start ---")
for u in CustomUser.objects.filter(email__contains='702'):
    print(f"EMAIL_IN_DB: {u.email}")
print("--- End ---")
