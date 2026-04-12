from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
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
        if user.role == 'hr':
            hr_profile = getattr(user, 'hr_profile', None)
            if hr_profile:
                return Application.objects.filter(job__hr_profile=hr_profile)
            return Application.objects.none()
        elif user.role == 'job_seeker':
            js_profile = getattr(user, 'job_seeker_profile', None)
            if js_profile:
                return Application.objects.filter(job_seeker=js_profile)
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
            
        application.status = new_status
        application.save()

        # Create Notification
        Notification.objects.create(
            user=application.job_seeker.user,
            title=f"Application {new_status.title()}",
            message=f"Your application for {application.job.title} has been {new_status}."
        )

        return Response(ApplicationSerializer(application).data)

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
