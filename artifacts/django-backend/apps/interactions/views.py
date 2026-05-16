from django.db import IntegrityError
from django.db.models import F
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.videos.models import Video
from .models import Like, Comment, VideoReport
from .serializers import LikedVideoSerializer, CommentSerializer, VideoReportSerializer


class InteractionPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


# ================================================================== #
#  LIKES
# ================================================================== #

# POST /api/videos/{id}/like/
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def like_video(request, pk):
    try:
        video = Video.objects.get(pk=pk, status=Video.STATUS_APPROVED, visibility="public")
    except Video.DoesNotExist:
        return Response(
            {"success": False, "message": "Video not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        Like.objects.create(user=request.user, video=video)
        # Atomic increment
        Video.objects.filter(pk=pk).update(like_count=F("like_count") + 1)
        video.refresh_from_db(fields=["like_count"])
    except IntegrityError:
        return Response(
            {"success": False, "message": "You have already liked this video."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "success": True,
            "message": "Video liked.",
            "like_count": video.like_count,
            "liked": True,
        },
        status=status.HTTP_201_CREATED,
    )


# DELETE /api/videos/{id}/like/
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def unlike_video(request, pk):
    try:
        video = Video.objects.get(pk=pk)
    except Video.DoesNotExist:
        return Response(
            {"success": False, "message": "Video not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    deleted, _ = Like.objects.filter(user=request.user, video=video).delete()

    if not deleted:
        return Response(
            {"success": False, "message": "You have not liked this video."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Atomic decrement, never below 0
    Video.objects.filter(pk=pk, like_count__gt=0).update(like_count=F("like_count") - 1)
    video.refresh_from_db(fields=["like_count"])

    return Response(
        {
            "success": True,
            "message": "Like removed.",
            "like_count": video.like_count,
            "liked": False,
        },
        status=status.HTTP_200_OK,
    )


# GET /api/likes/my-likes/
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_liked_videos(request):
    likes = (
        Like.objects.filter(user=request.user)
        .select_related("video__scholar")
        .order_by("-created_at")
    )

    paginator = InteractionPagination()
    page = paginator.paginate_queryset(likes, request)
    serializer = LikedVideoSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


# ================================================================== #
#  COMMENTS
# ================================================================== #

# GET + POST /api/videos/{id}/comments/
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def video_comments(request, pk):
    try:
        video = Video.objects.get(pk=pk, status=Video.STATUS_APPROVED)
    except Video.DoesNotExist:
        return Response(
            {"success": False, "message": "Video not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        comments = Comment.objects.filter(video=video).select_related("user")
        paginator = InteractionPagination()
        page = paginator.paginate_queryset(comments, request)
        serializer = CommentSerializer(page, many=True)
        response = paginator.get_paginated_response(serializer.data)
        response.data["comment_count"] = comments.count()
        return response

    # POST — must be authenticated
    if not request.user.is_authenticated:
        return Response(
            {"success": False, "message": "Authentication required to comment."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    serializer = CommentSerializer(
        data=request.data,
        context={"request": request, "video": video},
    )
    if not serializer.is_valid():
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
    comment = serializer.save()
    return Response(
        {"success": True, "comment": CommentSerializer(comment).data},
        status=status.HTTP_201_CREATED,
    )


# POST /api/videos/{id}/report/
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def report_video(request, pk):
    try:
        video = Video.objects.get(pk=pk)
    except Video.DoesNotExist:
        return Response({"success": False, "message": "Video not found."}, status=status.HTTP_404_NOT_FOUND)

    if VideoReport.objects.filter(user=request.user, video=video).exists():
        return Response({"success": False, "message": "You have already reported this video."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = VideoReportSerializer(data=request.data, context={"request": request, "video": video})
    if not serializer.is_valid():
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    serializer.save()
    return Response({"success": True, "message": "Report submitted. Thank you for helping keep IslamicTube safe."}, status=status.HTTP_201_CREATED)


# DELETE /api/comments/{id}/
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_comment(request, pk):
    try:
        comment = Comment.objects.select_related("user").get(pk=pk)
    except Comment.DoesNotExist:
        return Response(
            {"success": False, "message": "Comment not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if comment.user != request.user and not request.user.is_staff:
        return Response(
            {"success": False, "message": "You can only delete your own comments."},
            status=status.HTTP_403_FORBIDDEN,
        )

    comment.delete()
    return Response(
        {"success": True, "message": "Comment deleted."},
        status=status.HTTP_200_OK,
    )
