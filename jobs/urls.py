from django.urls import path
from . import views

urlpatterns = [
    path('jobs/', views.JobListCreateView.as_view(), name='job-list-create'),
    path('jobs/<uuid:pk>/', views.JobDetailView.as_view(), name='job-detail'),
    path('applications/', views.ApplicationListView.as_view(), name='application-list'),
    path('applications/apply/', views.ApplicationCreateView.as_view(), name='application-create'),
    path('applications/<uuid:pk>/resume/', views.ApplicationResumeView.as_view(), name='application-resume'),
    path('applications/<uuid:pk>/status/', views.ApplicationUpdateStatusView.as_view(), name='application-update-status'),
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<uuid:pk>/read/', views.NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('hr/stats/', views.HRStatsView.as_view(), name='hr-stats'),
]
