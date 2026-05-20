import cloudinary
import cloudinary.uploader

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Video
from .serializers import (
    VideoListSerializer,
    VideoDetailSerializer,
    VideoUploadSerializer,
    VideoUpdateSerializer,
    AdminStatusSerializer,
)


# ------------------------------------------------------------------ #
#  Helpers
# ------------------------------------------------------------------ #

class VideoPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


def _paginate(queryset, request, serializer_class):
    paginator = VideoPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = serializer_class(page, many=True)
    return paginator.get_paginated_response(serializer.data)


# ------------------------------------------------------------------ #
#  GET /api/videos/  — list approved, public videos
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([AllowAny])
def list_videos(request):
    qs = Video.objects.filter(
        status=Video.STATUS_APPROVED,
        visibility="public",
    ).select_related("scholar")

    category = request.query_params.get("category")
    if category:
        qs = qs.filter(category=category)

    scholar = request.query_params.get("scholar")
    if scholar:
        qs = qs.filter(scholar__username=scholar)

    video_type = request.query_params.get("type")
    if video_type:
        qs = qs.filter(video_type=video_type)

    search = request.query_params.get("search")
    if search:
        qs = qs.filter(title__icontains=search)

    ordering = request.query_params.get("ordering", "-created_at")
    allowed_orderings = {
        "newest": "-created_at",
        "oldest": "created_at",
        "popular": "-view_count",
        "liked": "-like_count",
    }
    qs = qs.order_by(allowed_orderings.get(ordering, "-created_at"))

    return _paginate(qs, request, VideoListSerializer)


# ------------------------------------------------------------------ #
#  GET /api/videos/{id}/  — detail + increment view count
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([AllowAny])
def video_detail(request, pk):
    try:
        video = Video.objects.select_related("scholar").get(pk=pk)
    except Video.DoesNotExist:
        return Response(
            {"success": False, "message": "Video not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if video.status != Video.STATUS_APPROVED:
        is_owner = request.user.is_authenticated and request.user == video.scholar
        is_admin = request.user.is_authenticated and request.user.is_staff
        if not (is_owner or is_admin):
            return Response(
                {"success": False, "message": "Video not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    video.increment_views()
    serializer = VideoDetailSerializer(video)
    return Response({"success": True, "video": serializer.data}, status=status.HTTP_200_OK)


# ------------------------------------------------------------------ #
#  POST /api/videos/upload/  — scholar only
# ------------------------------------------------------------------ #
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_video(request):
    if not request.user.is_scholar:
        return Response(
            {"success": False, "message": "Only scholars can upload videos."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = VideoUploadSerializer(data=request.data, context={"request": request})
    if not serializer.is_valid():
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    video = serializer.save()
    return Response(
        {
            "success": True,
            "message": "Video submitted for review. It will be published after approval.",
            "video": VideoDetailSerializer(video).data,
        },
        status=status.HTTP_201_CREATED,
    )


# ------------------------------------------------------------------ #
#  GET /api/videos/my-videos/  — scholar's own videos (all statuses)
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_videos(request):
    if not request.user.is_scholar:
        return Response(
            {"success": False, "message": "Only scholars can access this endpoint."},
            status=status.HTTP_403_FORBIDDEN,
        )

    qs = Video.objects.filter(scholar=request.user).select_related("scholar")

    status_filter = request.query_params.get("status")
    if status_filter in [Video.STATUS_PENDING, Video.STATUS_APPROVED, Video.STATUS_REJECTED]:
        qs = qs.filter(status=status_filter)

    return _paginate(qs, request, VideoDetailSerializer)


# ------------------------------------------------------------------ #
#  PATCH /api/videos/{id}/update/  — scholar edits own pending video
# ------------------------------------------------------------------ #
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_video(request, pk):
    try:
        video = Video.objects.get(pk=pk, scholar=request.user)
    except Video.DoesNotExist:
        return Response(
            {"success": False, "message": "Video not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = VideoUpdateSerializer(video, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
    serializer.save()
    return Response(
        {"success": True, "video": VideoDetailSerializer(video).data},
        status=status.HTTP_200_OK,
    )


# ------------------------------------------------------------------ #
#  PATCH /api/videos/{id}/approve/  — admin only
# ------------------------------------------------------------------ #
@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def approve_video(request, pk):
    try:
        video = Video.objects.get(pk=pk)
    except Video.DoesNotExist:
        return Response(
            {"success": False, "message": "Video not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if video.status == Video.STATUS_APPROVED:
        return Response(
            {"success": False, "message": "Video is already approved."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    video.status = Video.STATUS_APPROVED
    video.rejection_reason = ""
    video.approved_by = request.user
    video.approved_at = timezone.now()
    video.save(update_fields=["status", "rejection_reason", "approved_by", "approved_at", "updated_at"])

    if hasattr(video.scholar, "scholar_profile"):
        from django.db.models import F
        video.scholar.scholar_profile.__class__.objects.filter(
            user=video.scholar
        ).update(video_count=F("video_count") + 1)

    return Response(
        {
            "success": True,
            "message": f'Video "{video.title}" approved and published.',
            "video": VideoDetailSerializer(video).data,
        },
        status=status.HTTP_200_OK,
    )


# ------------------------------------------------------------------ #
#  PATCH /api/videos/{id}/reject/  — admin only
# ------------------------------------------------------------------ #
@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def reject_video(request, pk):
    try:
        video = Video.objects.get(pk=pk)
    except Video.DoesNotExist:
        return Response(
            {"success": False, "message": "Video not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if video.status == Video.STATUS_REJECTED:
        return Response(
            {"success": False, "message": "Video is already rejected."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = AdminStatusSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    video.status = Video.STATUS_REJECTED
    video.rejection_reason = serializer.validated_data.get("rejection_reason", "")
    video.approved_by = None
    video.approved_at = None
    video.save(update_fields=["status", "rejection_reason", "approved_by", "approved_at", "updated_at"])

    return Response(
        {
            "success": True,
            "message": f'Video "{video.title}" rejected.',
            "video": VideoDetailSerializer(video).data,
        },
        status=status.HTTP_200_OK,
    )


# ------------------------------------------------------------------ #
#  GET /api/videos/pending/  — admin: list all pending videos
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([IsAdminUser])
def pending_videos(request):
    qs = Video.objects.filter(
        status=Video.STATUS_PENDING
    ).select_related("scholar").order_by("created_at")
    return _paginate(qs, request, VideoDetailSerializer)


# ------------------------------------------------------------------ #
#  GET /api/videos/{id}/related/  — recommendations
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([AllowAny])
def related_videos(request, pk):
    try:
        video = Video.objects.select_related("scholar").get(pk=pk, status=Video.STATUS_APPROVED)
    except Video.DoesNotExist:
        return Response({"success": False, "message": "Video not found."}, status=404)

    limit = int(request.query_params.get("limit", 10))

    same_cat = (
        Video.objects.filter(status=Video.STATUS_APPROVED, visibility="public", category=video.category)
        .exclude(pk=pk)
        .select_related("scholar")
        .order_by("-view_count")[:limit]
    )
    ids = set(v.pk for v in same_cat)
    more = (
        Video.objects.filter(status=Video.STATUS_APPROVED, visibility="public", scholar=video.scholar)
        .exclude(pk=pk)
        .exclude(pk__in=ids)
        .select_related("scholar")
        .order_by("-created_at")[:max(0, limit - len(ids))]
    )

    results = list(same_cat) + list(more)
    if len(results) < limit:
        fill = (
            Video.objects.filter(status=Video.STATUS_APPROVED, visibility="public")
            .exclude(pk__in=[v.pk for v in results] + [pk])
            .select_related("scholar")
            .order_by("-view_count")[:limit - len(results)]
        )
        results += list(fill)

    return Response(
        {"success": True, "count": len(results), "results": VideoListSerializer(results, many=True).data},
        status=200,
    )


# ------------------------------------------------------------------ #
#  POST /api/videos/cloudinary-upload/  — upload file to Cloudinary
# ------------------------------------------------------------------ #
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cloudinary_upload(request):
    if not request.user.is_scholar:
        return Response(
            {"success": False, "message": "Only scholars can upload videos."},
            status=status.HTTP_403_FORBIDDEN,
        )

    file = request.FILES.get("file")
    if not file:
        return Response(
            {"success": False, "message": "No file provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    file_type = request.data.get("type", "video")

    try:
        result = cloudinary.uploader.upload(
            file,
            resource_type=file_type,
            folder="islamictube/",
        )
        return Response({
            "success": True,
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "duration": result.get("duration", 0),
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )