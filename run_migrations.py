import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'careermate.settings')
django.setup()

from django.core.management import call_command

print("=" * 50)
print("Running Django Migrations")
print("=" * 50)

try:
    print("\n1. Checking for new migrations...")
    call_command('makemigrations', verbosity=2)
    
    print("\n2. Applying migrations...")
    call_command('migrate', verbosity=2)
    
    print("\n3. Showing migration status...")
    call_command('showmigrations')
    
    print("\n" + "=" * 50)
    print("Migrations completed successfully!")
    print("=" * 50)
except Exception as e:
    print(f"\nError during migrations: {e}")
    import traceback
    traceback.print_exc()
