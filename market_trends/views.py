import json
import logging
import traceback
from datetime import datetime, timedelta
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.utils import timezone
from groq import Groq

from .models import MarketTrendCache
from accounts.permissions import IsJobSeeker

logger = logging.getLogger(__name__)

# Mapping of supported fields to Google Trends keywords
FIELD_KEYWORDS = {
    "Software Development": ["Python developer", "JavaScript developer", "React developer", "DevOps engineer", "Full stack developer"],
    "Data Science": ["Data scientist", "Machine learning", "Data analyst", "Data engineer", "Business intelligence"],
    "Product Design": ["UI UX designer", "Product designer", "Figma", "User research", "Design systems"],
    "Cybersecurity": ["Cybersecurity analyst", "Penetration testing", "SOC analyst", "Cloud security", "Ethical hacking"],
    "Marketing": ["Digital marketing", "SEO specialist", "Content marketing", "Social media marketing", "Growth hacking"],
    "Finance": ["Financial analyst", "Fintech", "Blockchain developer", "Investment banking", "Risk management"],
    "Healthcare": ["Healthcare IT", "Telemedicine", "Health informatics", "Medical AI", "Clinical data"],
    "Cloud Computing": ["AWS architect", "Azure engineer", "Cloud DevOps", "Kubernetes", "Serverless computing"],
    "AI & Machine Learning": ["AI engineer", "Deep learning", "NLP engineer", "Computer vision", "MLOps"],
}


def fetch_google_trends(field):
    """Fetches real Google Trends data for the given field keywords."""
    keywords = FIELD_KEYWORDS.get(field)
    if not keywords:
        return None

    try:
        from pytrends.request import TrendReq
        pytrends = TrendReq(hl='en-US', tz=360, timeout=(10, 25))

        # Get interest over time (last 12 months)
        pytrends.build_payload(keywords[:5], cat=0, timeframe='today 12-m')
        interest_over_time = pytrends.interest_over_time()

        monthly_data = {}
        if not interest_over_time.empty:
            # Resample to monthly and convert to dict
            monthly = interest_over_time.resample('M').mean()
            for col in keywords[:5]:
                if col in monthly.columns:
                    monthly_data[col] = [
                        {"month": row.name.strftime("%b"), "value": round(row[col], 1)}
                        for _, row in monthly.iterrows()
                    ]

        # Get related queries for context
        related = {}
        try:
            related_queries = pytrends.related_queries()
            for kw in keywords[:3]:
                if kw in related_queries and related_queries[kw]['top'] is not None:
                    related[kw] = related_queries[kw]['top'].head(5)['query'].tolist()
        except Exception:
            pass

        return {
            "monthly_interest": monthly_data,
            "related_queries": related,
            "keywords_used": keywords[:5],
            "fetched_at": timezone.now().isoformat()
        }

    except ImportError:
        logger.warning("pytrends not installed, skipping Google Trends data")
        return None
    except Exception as e:
        logger.error(f"Google Trends fetch failed: {str(e)}")
        return None


def generate_ai_trends(field, google_data=None):
    """Uses Groq AI to generate structured trend analysis, optionally enriched with Google Trends data."""
    client = Groq(api_key=settings.GROQ_API_KEY)

    context = ""
    if google_data and google_data.get("monthly_interest"):
        context = f"""
        I have REAL Google Trends data for this field. Use it to inform your analysis:
        Monthly interest data: {json.dumps(google_data['monthly_interest'])}
        Related queries: {json.dumps(google_data.get('related_queries', {}))}
        Base your popularity scores and demand trends on this real data.
        """

    prompt = f"""
    Generate a comprehensive job market trends analysis for the field: "{field}".
    {context}
    
    Return EXACTLY this JSON structure:
    {{
        "field": "{field}",
        "demand_level": "High demand" or "Medium demand" or "Low demand",
        "demand_trend": "Growing" or "Stable" or "Declining",
        "top_skills": [
            {{
                "name": "Skill Name",
                "category": "Category tag",
                "popularity_score": 85,
                "trend": "Rising" or "Stable" or "Emerging"
            }}
        ],
        "demand_over_time": [
            {{"month": "Jan", "value": 72}},
            {{"month": "Feb", "value": 75}},
            {{"month": "Mar", "value": 78}},
            {{"month": "Apr", "value": 74}},
            {{"month": "May", "value": 80}},
            {{"month": "Jun", "value": 83}},
            {{"month": "Jul", "value": 79}},
            {{"month": "Aug", "value": 85}},
            {{"month": "Sep", "value": 88}},
            {{"month": "Oct", "value": 90}},
            {{"month": "Nov", "value": 87}},
            {{"month": "Dec", "value": 92}}
        ],
        "market_growth": {{
            "twelve_month_growth": "+31%",
            "remote_percentage": "62%"
        }},
        "skill_gaps": [
            {{"name": "Skill Name", "gap_level": 75}}
        ],
        "top_employers": [
            {{"name": "Company Name", "open_roles": "+120 roles"}}
        ],
        "summary": "A 2-3 sentence text summary of trends in this field."
    }}
    
    Provide 5 top_skills, 12 months of demand_over_time, 3 skill_gaps, and 3 top_employers.
    Make the data realistic and current for 2026.
    """

    completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a job market analyst. Provide accurate, data-driven trend analysis in JSON format."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"}
    )

    content = completion.choices[0].message.content
    return json.loads(content)


class MarketTrendsView(APIView):
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def post(self, request):
        field = request.data.get('field', '').strip()

        if not field:
            return Response({
                'success': False,
                'message': 'Please select a field to view trends'
            }, status=status.HTTP_400_BAD_REQUEST)

        if field not in FIELD_KEYWORDS:
            return Response({
                'success': False,
                'message': 'No trends available for the selected field'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Step 1: Fetch real Google Trends data
            google_data = fetch_google_trends(field)

            # Step 2: Generate AI analysis enriched with real data
            ai_data = generate_ai_trends(field, google_data)

            # Step 3: Merge Google Trends line chart data if available
            if google_data and google_data.get("monthly_interest"):
                # Use the first keyword's real data for the main demand chart
                first_keyword = list(google_data["monthly_interest"].keys())[0]
                real_monthly = google_data["monthly_interest"][first_keyword]
                if len(real_monthly) >= 6:
                    ai_data["demand_over_time"] = real_monthly
                ai_data["data_source"] = "google_trends"
            else:
                ai_data["data_source"] = "ai_generated"

            # Step 4: Cache the result
            MarketTrendCache.objects.update_or_create(
                field=field,
                defaults={
                    'trend_data': ai_data,
                    'google_trends_data': google_data or {}
                }
            )

            return Response({
                'success': True,
                'data': ai_data,
                'is_fallback': False,
                'updated_at': timezone.now().isoformat()
            })

        except Exception as e:
            traceback.print_exc()
            logger.error(f"Market trends error: {str(e)}")

            # Fallback: try to serve cached data
            try:
                cached = MarketTrendCache.objects.get(field=field)
                return Response({
                    'success': True,
                    'data': cached.trend_data,
                    'is_fallback': True,
                    'message': 'Live update unavailable. Displaying last saved trends',
                    'updated_at': cached.updated_at.isoformat()
                })
            except MarketTrendCache.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Failed to fetch trends and no cached data available.',
                    'error': str(e)
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class MarketTrendsRefreshView(APIView):
    """Force refresh endpoint — same as fetch but always bypasses cache."""
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def post(self, request):
        # Delegates to the main view
        view = MarketTrendsView()
        view.request = request
        return view.post(request)
