from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.http import HttpResponse
import cloudinary
import cloudinary.api
import cloudinary.utils
import requests as http_requests
from .models import Job, Application, Notification
from .serializers import (
    JobSerializer, JobCreateSerializer, 
    ApplicationSerializer, ApplicationCreateSerializer,
    NotificationSerializer
)
from accounts.models import HRProfile, JobSeekerProfile

class IsHRUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'hr')

class IsJobSeeker(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'job_seeker')

class JobListCreateView(generics.ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return JobCreateSerializer
        return JobSerializer

    def get_queryset(self):
        # HR sees their own jobs, everyone else sees all active jobs
        user = self.request.user
        if user.is_authenticated and user.role == 'hr':
            hr_profile = getattr(user, 'hr_profile', None)
            if hr_profile:
                return Job.objects.filter(hr_profile=hr_profile)
        return Job.objects.filter(status='active')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'hr':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only HR can create jobs.")
        
        hr_profile = getattr(user, 'hr_profile', None)
        if not hr_profile:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("HR Profile not found.")
            
        serializer.save(hr_profile=hr_profile)

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHRUser()]
        return [permissions.IsAuthenticated()]

class ApplicationCreateView(generics.CreateAPIView):
    serializer_class = ApplicationCreateSerializer
    permission_classes = [IsJobSeeker]

    def perform_create(self, serializer):
        user = self.request.user
        js_profile = getattr(user, 'job_seeker_profile', None)
        if not js_profile:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Job Seeker Profile not found.")
        
        serializer.save(job_seeker=js_profile)

class ApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_queryset = Application.objects.select_related(
            'job', 'job__hr_profile', 'job_seeker', 'job_seeker__user'
        ).prefetch_related(
            'job_seeker__user__skills',
            'job_seeker__user__portfolio_items',
            'job_seeker__user__education_entries',
            'job_seeker__user__languages',
        )
        if user.role == 'hr':
            hr_profile = getattr(user, 'hr_profile', None)
            if hr_profile:
                return base_queryset.filter(job__hr_profile=hr_profile)
            return Application.objects.none()
        elif user.role == 'job_seeker':
            js_profile = getattr(user, 'job_seeker_profile', None)
            if js_profile:
                return base_queryset.filter(job_seeker=js_profile)
            return Application.objects.none()
        return Application.objects.none()

class ApplicationUpdateStatusView(APIView):
    permission_classes = [IsHRUser]

    def patch(self, request, pk):
        application = get_object_or_404(Application, pk=pk)
        
        # Verify hr owns the job
        hr_profile = getattr(request.user, 'hr_profile', None)
        if application.job.hr_profile != hr_profile:
            return Response({"error": "You do not have permission to update this application."}, status=status.HTTP_403_FORBIDDEN)
            
        new_status = request.data.get('status')
        if new_status not in [c[0] for c in Application.StatusChoices.choices]:
            return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
            
        hr_message = request.data.get('hr_message', '').strip()

        application.status = new_status
        if hr_message:
            application.hr_message = hr_message
        application.save()

        job_seeker_user = application.job_seeker.user
        job_title = application.job.title
        company_name = application.job.hr_profile.company_name
        hr_name = request.user.full_name

        # Build notification message
        if new_status == 'approved':
            notification_title = f"Congratulations! You've been hired for {job_title}!"
            if hr_message:
                notification_message = f"🎉 {company_name} has accepted your application for {job_title}. Message from {hr_name}: \"{hr_message}\""
            else:
                notification_message = f"🎉 {company_name} has accepted your application for {job_title}. Congratulations!"
        elif new_status == 'rejected':
            notification_title = f"Application Update - {job_title}"
            if hr_message:
                notification_message = f"Thank you for applying to {job_title} at {company_name}. Message from {hr_name}: \"{hr_message}\""
            else:
                notification_message = f"Thank you for applying to {job_title} at {company_name}. Unfortunately, we decided to move forward with another candidate."
        else:
            notification_title = f"Application {new_status.title()} - {job_title}"
            notification_message = f"Your application for {job_title} at {company_name} has been {new_status}."

        # Create in-app notification
        Notification.objects.create(
            user=job_seeker_user,
            title=notification_title,
            message=notification_message,
        )

        # Send email for final decisions
        if new_status == 'approved':
            try:
                from accounts.utils.email_service import EmailService
                EmailService.send_application_approved_email(
                    user=job_seeker_user,
                    job_title=job_title,
                    company_name=company_name,
                    hr_name=hr_name,
                    hr_message=hr_message or None,
                )
            except Exception as e:
                print(f"Failed to send approval email: {e}")
        elif new_status == 'rejected':
            try:
                from accounts.utils.email_service import EmailService
                EmailService.send_application_rejected_email(
                    user=job_seeker_user,
                    job_title=job_title,
                    company_name=company_name,
                    hr_name=hr_name,
                    hr_message=hr_message or None,
                )
            except Exception as e:
                print(f"Failed to send rejection email: {e}")

        return Response(ApplicationSerializer(application).data)


class ApplicationResumeView(APIView):
    """Securely stream an application resume for its applicant or the owning HR user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        application = get_object_or_404(
            Application.objects.select_related('job__hr_profile', 'job_seeker'),
            pk=pk,
        )

        is_owning_hr = (
            request.user.role == 'hr'
            and getattr(request.user, 'hr_profile', None) == application.job.hr_profile
        )
        is_applicant = (
            request.user.role == 'job_seeker'
            and getattr(request.user, 'job_seeker_profile', None) == application.job_seeker
        )
        if not (is_owning_hr or is_applicant):
            return Response(
                {'error': 'You do not have permission to view this resume.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if not application.resume:
            return Response({'error': 'No resume was uploaded for this application.'}, status=status.HTTP_404_NOT_FOUND)

        # Step 1: Generate the download URL from Cloudinary
        try:
            download_url = application.resume.url
        except Exception as e:
            import traceback
            print(f"ResumeView: Failed to generate URL for application {pk}: {e}")
            print(traceback.format_exc())
            return Response(
                {'error': f'Could not generate download URL for the resume. Details: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not download_url:
            return Response(
                {'error': 'Resume URL was empty. The file may have been deleted from storage.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Step 2: Download the file from Cloudinary storage
        try:
            storage_response = http_requests.get(download_url, timeout=30)
        except http_requests.exceptions.Timeout:
            return Response(
                {'error': 'Resume download timed out. The file storage service may be temporarily unavailable.'},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except http_requests.exceptions.ConnectionError as conn_err:
            return Response(
                {'error': f'Could not connect to file storage. Details: {str(conn_err)}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except http_requests.exceptions.RequestException as req_err:
            return Response(
                {'error': f'Failed to download resume from storage. Details: {str(req_err)}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if storage_response.status_code != 200:
            return Response(
                {'error': f'File storage returned HTTP {storage_response.status_code}. The resume may have been moved or deleted.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # Step 3: Return the file
        try:
            content_type = storage_response.headers.get('Content-Type', 'application/octet-stream')
            response = HttpResponse(storage_response.content, content_type=content_type)
            filename = application.resume.name.rsplit('/', 1)[-1] if application.resume.name else 'resume'
            disposition = 'inline' if ('pdf' in content_type.lower() or 'image' in content_type.lower()) else 'attachment'
            response['Content-Disposition'] = f'{disposition}; filename="{filename}"'
            response['Content-Length'] = len(storage_response.content)
            return response
        except Exception as e:
            import traceback
            print(f"ResumeView: Failed to build response for application {pk}: {e}")
            print(traceback.format_exc())
            return Response(
                {'error': f'Failed to build the resume response. Details: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({"success": True})


class HRStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'hr':
            return Response({"error": "Only HR users can access this endpoint."}, status=status.HTTP_403_FORBIDDEN)

        hr_profile = getattr(request.user, 'hr_profile', None)
        if not hr_profile:
            return Response({"error": "HR Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        total_jobs = Job.objects.filter(hr_profile=hr_profile).count()
        active_jobs = Job.objects.filter(hr_profile=hr_profile, status='active').count()
        total_applications = Application.objects.filter(job__hr_profile=hr_profile).count()
        pending_applications = Application.objects.filter(job__hr_profile=hr_profile, status='pending').count()
        approved_applications = Application.objects.filter(job__hr_profile=hr_profile, status='approved').count()
        rejected_applications = Application.objects.filter(job__hr_profile=hr_profile, status='rejected').count()

        return Response({
            "success": True,
            "data": {
                "total_jobs": total_jobs,
                "active_jobs": active_jobs,
                "total_applications": total_applications,
                "pending_applications": pending_applications,
                "approved_applications": approved_applications,
                "rejected_applications": rejected_applications,
            }
        })
