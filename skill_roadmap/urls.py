from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.GenerateRoadmapView.as_view(), name='generate-roadmap'),
    path('list/', views.UserRoadmapListView.as_view(), name='list-roadmaps'),
    path('<uuid:pk>/', views.UserRoadmapDetailView.as_view(), name='roadmap-detail'),
    path('chat/', views.SkillBotChatView.as_view(), name='skillbot-chat'),
]
