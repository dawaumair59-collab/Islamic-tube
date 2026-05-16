from django.db import IntegrityError
from django.db.models import Count
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.accounts.models import User
from apps.videos.models import Video
from apps.videos.serializers import VideoListSerializer
from .models import Subscription
from .serializers import ScholarSubscriptionSerializer


class SubPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


# ------------------------------------------------------------------ #
#  POST /api/subscriptions/follow/{username}/
# ------------------------------------------------------------------ #
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def follow_scholar(request, username):
    try:
        scholar = User.objects.get(username=username, is_scholar=True)
    except User.DoesNotExist:
        return Response(
            {"success": False, "message": "Scholar not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if scholar == request.user:
        return Response(
            {"success": False, "message": "You cannot follow yourself."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        Subscription.objects.create(subscriber=request.user, scholar=scholar)
    except IntegrityError:
        return Response(
            {"success": False, "message": f"You are already following {scholar.full_name}."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "success": True,
            "message": f"You are now following {scholar.full_name}.",
            "scholar": ScholarSubscriptionSerializer(scholar, context={"request": request}).data,
        },
        status=status.HTTP_201_CREATED,
    )


# ------------------------------------------------------------------ #
#  DELETE /api/subscriptions/unfollow/{username}/
# ------------------------------------------------------------------ #
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def unfollow_scholar(request, username):
    try:
        scholar = User.objects.get(username=username, is_scholar=True)
    except User.DoesNotExist:
        return Response(
            {"success": False, "message": "Scholar not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    deleted, _ = Subscription.objects.filter(
        subscriber=request.user, scholar=scholar
    ).delete()

    if not deleted:
        return Response(
            {"success": False, "message": f"You are not following {scholar.full_name}."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "success": True,
            "message": f"You have unfollowed {scholar.full_name}.",
            "subscriber_count": scholar.subscribers.count(),
        },
        status=status.HTTP_200_OK,
    )


# ------------------------------------------------------------------ #
#  GET /api/subscriptions/  — list all subscribed scholars
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_subscriptions(request):
    scholar_ids = Subscription.objects.filter(
        subscriber=request.user
    ).values_list("scholar_id", flat=True)

    scholars = (
        User.objects.filter(id__in=scholar_ids, is_scholar=True)
        .annotate(sub_count=Count("subscribers"))
        .order_by("-sub_count")
    )

    paginator = SubPagination()
    page = paginator.paginate_queryset(scholars, request)
    serializer = ScholarSubscriptionSerializer(page, many=True, context={"request": request})
    return paginator.get_paginated_response(serializer.data)


# ------------------------------------------------------------------ #
#  GET /api/subscriptions/feed/  — videos from followed scholars
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def subscribed_feed(request):
    scholar_ids = Subscription.objects.filter(
        subscriber=request.user
    ).values_list("scholar_id", flat=True)

    if not scholar_ids:
        return Response(
            {
                "success": True,
                "message": "Follow some scholars to see their videos here.",
                "count": 0, "next": None, "previous": None, "results": [],
            },
            status=status.HTTP_200_OK,
        )

    videos = (
        Video.objects.filter(
            scholar_id__in=scholar_ids,
            status=Video.STATUS_APPROVED,
            visibility="public",
        )
        .select_related("scholar")
        .order_by("-created_at")
    )

    paginator = SubPagination()
    page = paginator.paginate_queryset(videos, request)
    serializer = VideoListSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)
