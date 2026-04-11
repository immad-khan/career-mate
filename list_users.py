import os
import django
import sys

# Set up Django environment
sys.path.append('d:\\Desktop\\careermate')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'careermate.settings')
django.setup()

from accounts.models import CustomUser

print("--- Recent Users ---")
for u in CustomUser.objects.all().order_by('-created_at')[:10]:
    print(f"Email: {u.email}, Role: {u.role}, Joined: {u.created_at}")
print("--------------------")
