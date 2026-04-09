from django.core.management.base import BaseCommand
from django.conf import settings
from accounts.models import CustomUser
import os


class Command(BaseCommand):
    help = 'Seed admin user from environment variables'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update existing admin',
        )
    
    def handle(self, *args, **options):
        email = os.getenv('ADMIN_EMAIL', 'admin@careermate.com')
        password = os.getenv('ADMIN_PASSWORD', 'Admin@123456')
        full_name = os.getenv('ADMIN_FULL_NAME', 'CareerMate Admin')
        
        # Check if admin exists
        existing_admin = CustomUser.objects.filter(email=email).first()
        
        if existing_admin:
            if options['force']:
                existing_admin.set_password(password)
                existing_admin.full_name = full_name
                existing_admin.is_email_verified = True
                existing_admin.is_active = True
                existing_admin.is_staff = True
                existing_admin.is_superuser = True
                existing_admin.role = 'admin'
                existing_admin.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Admin user updated: {email}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Admin user already exists: {email}. Use --force to update.')
                )
        else:
            # Create new admin
            admin_user = CustomUser.objects.create_superuser(
                email=email,
                password=password,
                full_name=full_name
            )
            self.stdout.write(
                self.style.SUCCESS(f'Admin user created successfully!')
            )
            self.stdout.write(f'  Email: {email}')
            self.stdout.write(f'  Password: {password}')
            self.stdout.write(
                self.style.WARNING('  ⚠️  Please change the password after first login!')
            )