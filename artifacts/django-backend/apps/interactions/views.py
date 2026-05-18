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


# ================================================================== #
#  WATCH HISTORY
# ================================================================== #

from django.utils import timezone
from .models import WatchHistory, SavedVideo
from .serializers import WatchHistorySerializer, SavedVideoSerializer


# GET  /api/watch-history/   – list user's history
# DELETE /api/watch-history/ – clear all
@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def watch_history_list(request):
    if request.method == "GET":
        qs = WatchHistory.objects.filter(user=request.user).select_related("video__scholar")
        paginator = InteractionPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = WatchHistorySerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    # DELETE — clear all
    WatchHistory.objects.filter(user=request.user).delete()
    return Response({"success": True, "message": "Watch history cleared."}, status=status.HTTP_200_OK)


# POST /api/watch-history/<id>/ – add or refresh entry
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def watch_history_add(request, pk):
    try:
        video = Video.objects.get(pk=pk, status=Video.STATUS_APPROVED)
    except Video.DoesNotExist:
        return Response({"success": False, "message": "Video not found."}, status=status.HTTP_404_NOT_FOUND)

    WatchHistory.objects.update_or_create(
        user=request.user,
        video=video,
        defaults={"watched_at": timezone.now()},
    )
    return Response({"success": True, "message": "Added to watch history."}, status=status.HTTP_200_OK)


# ================================================================== #
#  SAVED VIDEOS
# ================================================================== #

# GET /api/saved/ – list saved videos
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def saved_list(request):
    qs = SavedVideo.objects.filter(user=request.user).select_related("video__scholar")
    paginator = InteractionPagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = SavedVideoSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


# POST /api/saved/<id>/   – save
# DELETE /api/saved/<id>/ – unsave
@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def saved_toggle(request, pk):
    try:
        video = Video.objects.get(pk=pk)
    except Video.DoesNotExist:
        return Response({"success": False, "message": "Video not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "POST":
        obj, created = SavedVideo.objects.get_or_create(user=request.user, video=video)
        return Response(
            {"success": True, "saved": True, "message": "Saved." if created else "Already saved."},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    # DELETE
    deleted, _ = SavedVideo.objects.filter(user=request.user, video=video).delete()
    if not deleted:
        return Response({"success": False, "message": "Not in saved list."}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"success": True, "saved": False, "message": "Removed from saved."}, status=status.HTTP_200_OK)


# GET /api/saved/<id>/status/ – check if saved
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def saved_status(request, pk):
    saved = SavedVideo.objects.filter(user=request.user, video_id=pk).exists()
    return Response({"saved": saved}, status=status.HTTP_200_OK)


# ================================================================== #
#  COMMENT REPLIES
# ================================================================== #
from .models import CommentReply
from .serializers import CommentReplySerializer


# GET + POST /api/comments/{id}/replies/
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def comment_replies(request, pk):
    try:
        comment = Comment.objects.get(pk=pk)
    except Comment.DoesNotExist:
        return Response({"success": False, "message": "Comment not found."}, status=404)

    if request.method == "GET":
        replies = CommentReply.objects.filter(comment=comment).select_related("user")
        serializer = CommentReplySerializer(replies, many=True)
        return Response({"success": True, "count": replies.count(), "results": serializer.data})

    if not request.user.is_authenticated:
        return Response({"success": False, "message": "Authentication required."}, status=401)

    serializer = CommentReplySerializer(
        data=request.data,
        context={"request": request, "comment": comment},
    )
    if not serializer.is_valid():
        return Response({"success": False, "errors": serializer.errors}, status=400)
    reply = serializer.save()
    return Response({"success": True, "reply": CommentReplySerializer(reply).data}, status=201)


# DELETE /api/replies/{id}/
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_reply(request, pk):
    try:
        reply = CommentReply.objects.select_related("user").get(pk=pk)
    except CommentReply.DoesNotExist:
        return Response({"success": False, "message": "Reply not found."}, status=404)

    if reply.user != request.user and not request.user.is_staff:
        return Response({"success": False, "message": "You can only delete your own replies."}, status=403)

    reply.delete()
    return Response({"success": True, "message": "Reply deleted."})


# ================================================================== #
#  PLAYLISTS
# ================================================================== #
from .models import Playlist
from .serializers import PlaylistSerializer


# GET + POST /api/playlists/
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def playlist_list(request):
    if request.method == "GET":
        playlists = Playlist.objects.filter(user=request.user).prefetch_related("videos")
        serializer = PlaylistSerializer(playlists, many=True)
        return Response({"success": True, "count": playlists.count(), "results": serializer.data})

    serializer = PlaylistSerializer(data=request.data, context={"request": request})
    if not serializer.is_valid():
        return Response({"success": False, "errors": serializer.errors}, status=400)
    playlist = serializer.save()
    return Response({"success": True, "playlist": PlaylistSerializer(playlist).data}, status=201)


# GET + PATCH + DELETE /api/playlists/{id}/
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def playlist_detail(request, pk):
    try:
        playlist = Playlist.objects.prefetch_related("videos").get(pk=pk, user=request.user)
    except Playlist.DoesNotExist:
        return Response({"success": False, "message": "Playlist not found."}, status=404)

    if request.method == "GET":
        from apps.videos.serializers import VideoListSerializer
        return Response({
            "success": True,
            "playlist": PlaylistSerializer(playlist).data,
            "videos": VideoListSerializer(playlist.videos.filter(status="approved"), many=True).data,
        })

    if request.method == "PATCH":
        serializer = PlaylistSerializer(playlist, data=request.data, partial=True, context={"request": request})
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=400)
        serializer.save()
        return Response({"success": True, "playlist": serializer.data})

    playlist.delete()
    return Response({"success": True, "message": "Playlist deleted."})


# POST /api/playlists/{id}/add/{video_id}/
@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def playlist_video(request, pk, video_pk):
    try:
        playlist = Playlist.objects.get(pk=pk, user=request.user)
    except Playlist.DoesNotExist:
        return Response({"success": False, "message": "Playlist not found."}, status=404)

    try:
        from apps.videos.models import Video as VideoModel
        video = VideoModel.objects.get(pk=video_pk, status="approved")
    except VideoModel.DoesNotExist:
        return Response({"success": False, "message": "Video not found."}, status=404)

    if request.method == "POST":
        playlist.videos.add(video)
        return Response({"success": True, "message": "Video added to playlist."})

    playlist.videos.remove(video)
    return Response({"success": True, "message": "Video removed from playlist."})


# ================================================================== #
#  LIVE CHAT (polling)
# ================================================================== #
import json
from django.core.cache import cache


# GET + POST /api/live-chat/{room}/messages/
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def live_chat_messages(request, room):
    cache_key = f"live_chat_{room}"

    if request.method == "GET":
        since = int(request.query_params.get("since", 0))
        messages = cache.get(cache_key, [])
        new_msgs = [m for m in messages if m["ts"] > since]
        return Response({"success": True, "messages": new_msgs, "ts": int(__import__("time").time() * 1000)})

    if not request.user.is_authenticated:
        return Response({"success": False, "message": "Sign in to chat."}, status=401)

    text = request.data.get("text", "").strip()
    if not text or len(text) > 500:
        return Response({"success": False, "message": "Message must be 1-500 characters."}, status=400)

    messages = cache.get(cache_key, [])
    msg = {
        "id": len(messages) + 1,
        "text": text,
        "author": request.user.full_name or request.user.username,
        "username": request.user.username,
        "ts": int(__import__("time").time() * 1000),
    }
    messages.append(msg)
    # Keep last 100 messages
    if len(messages) > 100:
        messages = messages[-100:]
    cache.set(cache_key, messages, 3600)

    return Response({"success": True, "message": msg}, status=201)
