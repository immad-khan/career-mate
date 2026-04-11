from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({
        'success': True,
        'message': 'Welcome to CareerMate API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'profile': '/api/profile/',
            'admin': '/api/admin/',
            'resumes': '/api/resumes/',
        }
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('django-admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/resumes/', include('resumes.urls')),
    path('api/skill-roadmap/', include('skill_roadmap.urls')),
    path('api/market-trends/', include('market_trends.urls')),
    path('api/job-crawler/', include('job_crawler.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)