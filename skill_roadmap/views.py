import json
import logging
import traceback
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.utils import timezone
from groq import Groq

from .models import SkillRoadmap, RoadmapSection, RoadmapSkill, SkillBotChat
from .serializers import SkillRoadmapSerializer, SkillBotChatSerializer
from accounts.permissions import IsJobSeeker

logger = logging.getLogger(__name__)

class GenerateRoadmapView(APIView):
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def post(self, request):
        role = request.data.get('role')
        level = request.data.get('level', 'beginner')

        if not role:
            return Response({
                'success': False,
                'message': 'Please enter a valid role to proceed'
            }, status=status.HTTP_400_BAD_REQUEST)

        if level not in ['beginner', 'intermediate', 'advanced']:
            return Response({
                'success': False,
                'message': 'Please select a learning level to proceed'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            client = Groq(api_key=settings.GROQ_API_KEY)
            
            prompt = f"""
            Generate a detailed professional learning roadmap for the role of '{role}' at a '{level}' level.
            The roadmap should be structured into sections (e.g., Foundational, Core, Advanced, Tools, Interview Prep).
            Each section should contain 3-5 specific skills or topics.
            For each skill, provide a brief description and 2-3 high-quality learning resources (name and hypothetical URL or platform name like 'Coursera', 'YouTube', 'Documentation').
            
            Return the response EXACTLY in the following JSON format:
            {{
                "role": "{role}",
                "level": "{level}",
                "sections": [
                    {{
                        "title": "Section Title",
                        "description": "Short description",
                        "skills": [
                            {{
                                "name": "Skill Name",
                                "description": "What to learn",
                                "resources": [
                                    {{"name": "Resource Name", "url": "https://..."}}
                                ]
                            }}
                        ]
                    }}
                ]
            }}
            """

            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert career coach and technical architect. Provide structured, accurate learning roadmaps in JSON format."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model="llama3-70b-8192",
                response_format={"type": "json_object"}
            )

            roadmap_content = chat_completion.choices[0].message.content
            # Clean possible markdown code blocks if the response format isn't strictly respected by the model
            if "```json" in roadmap_content:
                roadmap_content = roadmap_content.split("```json")[1].split("```")[0].strip()
            elif "```" in roadmap_content:
                roadmap_content = roadmap_content.split("```")[1].split("```")[0].strip()
                
            data = json.loads(roadmap_content)

            # Save to Database
            roadmap = SkillRoadmap.objects.create(
                user=request.user,
                role=data.get('role', role),
                level=data.get('level', level)
            )

            for i, section_data in enumerate(data.get('sections', [])):
                section = RoadmapSection.objects.create(
                    roadmap=roadmap,
                    title=section_data.get('title'),
                    description=section_data.get('description'),
                    order=i
                )
                
                for j, skill_data in enumerate(section_data.get('skills', [])):
                    RoadmapSkill.objects.create(
                        section=section,
                        name=skill_data.get('name'),
                        description=skill_data.get('description'),
                        resources=skill_data.get('resources', []),
                        order=j
                    )

            return Response({
                'success': True,
                'message': 'Roadmap generated successfully',
                'data': SkillRoadmapSerializer(roadmap).data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            traceback.print_exc()
            logger.error(f"Roadmap generation error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to generate roadmap. Please try again later.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserRoadmapListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsJobSeeker]
    serializer_class = SkillRoadmapSerializer

    def get_queryset(self):
        return SkillRoadmap.objects.filter(user=self.request.user, is_active=True)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

class UserRoadmapDetailView(APIView):
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get(self, request, pk):
        roadmap = generics.get_object_or_404(SkillRoadmap, id=pk, user=request.user)
        serializer = SkillRoadmapSerializer(roadmap)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def patch(self, request, pk):
        # Used for toggling skill completion
        skill_id = request.data.get('skill_id')
        is_completed = request.data.get('is_completed', True)
        
        if not skill_id:
            return Response({'success': False, 'message': 'skill_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        skill = generics.get_object_or_404(RoadmapSkill, id=skill_id, section__roadmap__user=request.user)
        skill.is_completed = is_completed
        skill.completed_at = timezone.now() if is_completed else None
        skill.save()
        
        return Response({
            'success': True,
            'message': 'Progress updated',
            'data': {'is_completed': skill.is_completed}
        })

class SkillBotChatView(APIView):
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def post(self, request):
        message = request.data.get('message')
        if not message:
            return Response({
                'success': False,
                'message': 'Please enter a valid question'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            client = Groq(api_key=settings.GROQ_API_KEY)
            
            # Fetch context if user has an active roadmap
            active_roadmap = SkillRoadmap.objects.filter(user=request.user, is_active=True).first()
            context = ""
            if active_roadmap:
                context = f"The user is currently following a roadmap for '{active_roadmap.role}' at '{active_roadmap.level}' level."

            response = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": f"You are SkillBot, a helpful AI career assistant. {context} Provide short, encouraging, and accurate advice."
                    },
                    {
                        "role": "user",
                        "content": message
                    }
                ],
                model="llama3-8b-8192",
            )

            ai_response = response.choices[0].message.content
            
            # Save chat history
            SkillBotChat.objects.create(
                user=request.user,
                message=message,
                response=ai_response
            )

            return Response({
                'success': True,
                'data': {
                    'message': message,
                    'response': ai_response
                }
            })

        except Exception as e:
            traceback.print_exc()
            return Response({
                'success': False,
                'message': 'SkillBot is currently unavailable.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
