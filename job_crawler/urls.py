from django.urls import path
from .views import JobSearchView, SaveJobView, ApplyJobView

urlpatterns = [
    path('search/', JobSearchView.as_view(), name='job-search'),
    path('save/', SaveJobView.as_view(), name='job-save'),
    path('save/<str:job_id>/', SaveJobView.as_view(), name='job-unsave'),
    path('apply/', ApplyJobView.as_view(), name='job-apply'),
]
