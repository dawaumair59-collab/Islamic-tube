from django.db.models import Count, Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from apps.videos.models import Video
from apps.accounts.models import User
from .models import SearchLog
from .serializers import VideoSearchSerializer, ScholarSearchSerializer


class SearchPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 50


# ------------------------------------------------------------------ #
#  GET /api/search/?q=term
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([AllowAny])
def search(request):
    q = request.query_params.get("q", "").strip()
    search_type = request.query_params.get("type", "all")  # all | videos | scholars

    if not q:
        return Response(
            {"success": False, "message": "Query parameter 'q' is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(q) < 2:
        return Response(
            {"success": False, "message": "Query must be at least 2 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Log the search
    user = request.user if request.user.is_authenticated else None
    SearchLog.objects.create(query=q.lower(), user=user)

    videos  = []
    scholars = []

    if search_type in ("all", "videos"):
        category = request.query_params.get("category")
        video_qs = Video.objects.filter(
            status=Video.STATUS_APPROVED, visibility="public"
        ).filter(
            Q(title__icontains=q) |
            Q(description__icontains=q) |
            Q(tags__icontains=q)
        ).select_related("scholar")

        if category:
            video_qs = video_qs.filter(category=category)

        video_qs = video_qs.order_by("-view_count", "-created_at")
        videos = VideoSearchSerializer(video_qs[:50], many=True).data

    if search_type in ("all", "scholars"):
        scholar_qs = User.objects.filter(
            is_scholar=True
        ).filter(
            Q(full_name__icontains=q) |
            Q(username__icontains=q) |
            Q(bio__icontains=q)
        ).annotate(
            sub_count=Count("subscribers")
        ).order_by("-sub_count")

        scholars = ScholarSearchSerializer(
            scholar_qs[:20], many=True, context={"request": request}
        ).data

    return Response(
        {
            "success": True,
            "query": q,
            "results": {
                "videos":  {"count": len(videos),  "items": videos},
                "scholars": {"count": len(scholars), "items": scholars},
            },
        },
        status=status.HTTP_200_OK,
    )


# ------------------------------------------------------------------ #
#  GET /api/search/suggestions/?q=term
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([AllowAny])
def search_suggestions(request):
    q = request.query_params.get("q", "").strip()
    if not q or len(q) < 2:
        return Response({"success": True, "suggestions": []})

    # Titles that start with or contain the query
    video_titles = (
        Video.objects.filter(
            status=Video.STATUS_APPROVED, visibility="public",
            title__icontains=q,
        )
        .values_list("title", flat=True)
        .order_by("-view_count")[:5]
    )

    # Scholar names
    scholar_names = (
        User.objects.filter(is_scholar=True, full_name__icontains=q)
        .values_list("full_name", flat=True)[:3]
    )

    # Past popular queries
    past_queries = (
        SearchLog.objects.filter(query__icontains=q.lower())
        .values("query")
        .annotate(count=Count("query"))
        .order_by("-count")
        .values_list("query", flat=True)[:5]
    )

    combined = list(dict.fromkeys(
        list(video_titles) + list(scholar_names) + list(past_queries)
    ))[:10]

    return Response({"success": True, "query": q, "suggestions": combined})


# ------------------------------------------------------------------ #
#  GET /api/search/trending/
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([AllowAny])
def trending_searches(request):
    top_queries = (
        SearchLog.objects.values("query")
        .annotate(count=Count("query"))
        .order_by("-count")
        .values_list("query", "count")[:10]
    )

    trending = [{"query": q, "search_count": c} for q, c in top_queries]

    # If no searches yet, return sensible defaults
    if not trending:
        defaults = [
            "Quran tafsir", "Five pillars of Islam", "Islamic finance",
            "Seerah", "Hadith", "Morning dua", "Ramadan", "Fiqh",
        ]
        trending = [{"query": d, "search_count": 0} for d in defaults]

    return Response({"success": True, "trending": trending})
