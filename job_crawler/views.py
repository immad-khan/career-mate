from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import SavedJob, AppliedJob
from .serializers import SavedJobSerializer, AppliedJobSerializer
import pandas as pd
try:
    from jobspy import scrape_jobs
except ImportError:
    scrape_jobs = None

class JobSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        keyword = request.data.get('keyword')
        location = request.data.get('location', 'Pakistan')
        site_names = request.data.get('site_names', ["linkedin", "indeed", "glassdoor", "google"])
        
        if not keyword:
            return Response({
                'success': False,
                'message': 'Please enter a keyword to search'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Mock results generator
        def get_mock_jobs(term):
            return [
                {
                    'id': f'mock-1',
                    'site': 'LinkedIn',
                    'job_url': 'https://linkedin.com/jobs/',
                    'title': f'Senior {term}',
                    'company': 'TechNova Solutions',
                    'location': 'Remote',
                    'date_posted': '2 hours ago',
                    'salary': 'PKR 250k - 350k / month',
                    'description': f'We are looking for a Senior {term} to join our growing team.',
                    'is_remote': True,
                    'job_type': 'Full-time',
                },
                {
                    'id': f'mock-2',
                    'site': 'Indeed',
                    'job_url': 'https://indeed.com/',
                    'title': f'{term} Developer',
                    'company': 'DataSense Analytics',
                    'location': 'Lahore, Pakistan',
                    'date_posted': '1 day ago',
                    'salary': 'PKR 180k - 240k / month',
                    'description': f'Join us as a {term} Developer.',
                    'is_remote': False,
                    'job_type': 'Full-time',
                }
            ] if term.lower() != "unsupported" else []

        # Load local jobs using jobs app
        from jobs.models import Job
        local_jobs_qs = Job.objects.filter(status='active', title__icontains=keyword)
        local_jobs = []
        for j in local_jobs_qs:
            local_jobs.append({
                'id': f"local-{str(j.id)}",
                'site': 'CareerMate',
                'job_url': f'/dashboard/jobs/{j.id}', # Internally managed
                'title': j.title,
                'company': j.hr_profile.company_name,
                'location': 'N/A', # can add if model is updated
                'date_posted': j.created_at.strftime('%Y-%m-%d'),
                'salary': f"{j.salary_min} - {j.salary_max}" if j.salary_min else "Not disclosed",
                'description': j.description,
                'is_remote': j.job_type == 'Remote',
                'job_type': j.job_type,
                'is_local': True,
                'local_uuid': str(j.id)
            })

        if not scrape_jobs:
            mock_jobs = get_mock_jobs(keyword)
            return Response({
                'success': True,
                'data': local_jobs + mock_jobs,
                'message': 'Service initializing. Showing curated results.'
            }, status=status.HTTP_200_OK)

        try:
            # Scrape jobs using jobspy
            jobs_df = scrape_jobs(
                site_name=site_names,
                search_term=keyword,
                location=location,
                results_wanted=15,
                hours_old=72,
            )

            if jobs_df is None or jobs_df.empty:
                return Response({
                    'success': True,
                    'data': local_jobs,
                    'message': 'No external jobs match your search. Showing internal listings.' if local_jobs else 'No jobs match your search.'
                }, status=status.HTTP_200_OK)

            # Convert dataframe to list of dicts
            jobs_list = []
            for _, row in jobs_df.iterrows():
                job = {
                    'id': str(row.get('id', '')),
                    'site': row.get('site', 'unknown'),
                    'job_url': row.get('job_url', ''),
                    'title': row.get('title', 'Unknown Title'),
                    'company': row.get('company', 'Unknown Company'),
                    'location': row.get('location', 'Remote' if row.get('is_remote') else 'N/A'),
                    'date_posted': str(row.get('date_posted', '')),
                    'salary': f"{row.get('min_amount', '')} - {row.get('max_amount', '')} {row.get('currency', '')}" if row.get('min_amount') else "Not disclosed",
                    'description': row.get('description', ''),
                    'is_remote': bool(row.get('is_remote', False)),
                    'job_type': row.get('job_type', 'Full-time'),
                }
                jobs_list.append(job)

            jobs_list = local_jobs + jobs_list

            return Response({
                'success': True,
                'data': jobs_list,
                'count': len(jobs_list)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error occurred while searching for jobs: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SaveJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        job_data = request.data
        
        try:
            saved_job, created = SavedJob.objects.update_or_create(
                user=user,
                job_id=job_data.get('id'),
                defaults={
                    'title': job_data.get('title'),
                    'company': job_data.get('company'),
                    'location': job_data.get('location'),
                    'description': job_data.get('description'),
                    'salary': job_data.get('salary'),
                    'job_url': job_data.get('job_url'),
                    'source': job_data.get('site'),
                }
            )
            
            return Response({
                'success': True,
                'message': 'Job saved successfully' if created else 'Job info updated'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to save job: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        user = request.user
        saved_jobs = SavedJob.objects.filter(user=user)
        serializer = SavedJobSerializer(saved_jobs, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def delete(self, request, job_id):
        try:
            SavedJob.objects.filter(user=request.user, job_id=job_id).delete()
            return Response({
                'success': True,
                'message': 'Job removed from saved list'
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to remove job: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

class ApplyJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        job_data = request.data
        
        try:
            AppliedJob.objects.update_or_create(
                user=user,
                job_id=job_data.get('id'),
                defaults={
                    'title': job_data.get('title'),
                    'company': job_data.get('company'),
                    'status': 'Applied'
                }
            )
            
            return Response({
                'success': True,
                'message': 'Application submitted successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to submit application: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        user = request.user
        applied_jobs = AppliedJob.objects.filter(user=user)
        serializer = AppliedJobSerializer(applied_jobs, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
