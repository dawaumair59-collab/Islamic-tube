"""
Admin-only API views.  All require is_staff=True (IsAdminUser).
Mounted under /api/auth/admin/ via accounts/urls.py.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

from .models import User, ScholarProfile


class AdminPagination(PageNumberPagination):
    page_size = 30
    page_size_query_param = "page_size"
    max_page_size = 100


# ------------------------------------------------------------------ #
#  GET /api/auth/admin/stats/
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_stats(request):
    from apps.videos.models import Video
    from apps.interactions.models import VideoReport

    return Response({
        "success": True,
        "stats": {
            "total_videos":      Video.objects.count(),
            "total_users":       User.objects.filter(is_staff=False, is_scholar=False).count(),
            "total_scholars":    User.objects.filter(is_scholar=True).count(),
            "pending_videos":    Video.objects.filter(status=Video.STATUS_PENDING).count(),
            "pending_scholars":  ScholarProfile.objects.filter(verified=False).count(),
            "total_reports":     VideoReport.objects.count(),
            "approved_videos":   Video.objects.filter(status=Video.STATUS_APPROVED).count(),
            "rejected_videos":   Video.objects.filter(status=Video.STATUS_REJECTED).count(),
        },
    })


# ------------------------------------------------------------------ #
#  GET /api/auth/admin/users/
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_list_users(request):
    qs = User.objects.filter(is_staff=False).order_by("-date_joined")
    search = request.query_params.get("q")
    if search:
        qs = qs.filter(full_name__icontains=search) | qs.filter(email__icontains=search)

    paginator = AdminPagination()
    page = paginator.paginate_queryset(qs, request)
    data = [
        {
            "id":           u.id,
            "username":     u.username,
            "full_name":    u.full_name or u.username,
            "email":        u.email,
            "is_scholar":   u.is_scholar,
            "is_active":    u.is_active,
            "date_joined":  u.date_joined.isoformat(),
        }
        for u in page
    ]
    return paginator.get_paginated_response(data)


# ------------------------------------------------------------------ #
#  PATCH /api/auth/admin/users/<id>/ban/
# ------------------------------------------------------------------ #
@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def admin_ban_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"success": False, "message": "User not found."}, status=404)

    if user.is_staff:
        return Response({"success": False, "message": "Cannot ban admin users."}, status=400)

    user.is_active = not user.is_active
    user.save(update_fields=["is_active"])
    action = "banned" if not user.is_active else "unbanned"
    return Response({"success": True, "message": f"User {action}.", "is_active": user.is_active})


# ------------------------------------------------------------------ #
#  GET /api/auth/admin/scholars/
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_list_scholars(request):
    verified_param = request.query_params.get("verified")
    qs = ScholarProfile.objects.select_related("user").order_by("-created_at")
    if verified_param == "false":
        qs = qs.filter(verified=False)
    elif verified_param == "true":
        qs = qs.filter(verified=True)

    paginator = AdminPagination()
    page = paginator.paginate_queryset(qs, request)
    data = [
        {
            "id":              p.id,
            "user_id":         p.user.id,
            "username":        p.user.username,
            "full_name":       p.user.full_name or p.user.username,
            "email":           p.user.email,
            "expertise":       p.expertise,
            "institution":     p.institution,
            "qualifications":  p.qualifications,
            "verified":        p.verified,
            "subscriber_count":p.subscriber_count,
            "video_count":     p.video_count,
            "created_at":      p.created_at.isoformat(),
        }
        for p in page
    ]
    return paginator.get_paginated_response(data)


# ------------------------------------------------------------------ #
#  PATCH /api/auth/admin/scholars/<id>/verify/
# ------------------------------------------------------------------ #
@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def admin_verify_scholar(request, pk):
    try:
        profile = ScholarProfile.objects.select_related("user").get(pk=pk)
    except ScholarProfile.DoesNotExist:
        return Response({"success": False, "message": "Scholar not found."}, status=404)

    profile.verified = True
    profile.save(update_fields=["verified", "updated_at"])
    return Response({"success": True, "message": f"Scholar {profile.user.username} verified."})


# ------------------------------------------------------------------ #
#  PATCH /api/auth/admin/scholars/<id>/reject/
# ------------------------------------------------------------------ #
@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def admin_reject_scholar(request, pk):
    try:
        profile = ScholarProfile.objects.select_related("user").get(pk=pk)
    except ScholarProfile.DoesNotExist:
        return Response({"success": False, "message": "Scholar not found."}, status=404)

    user = profile.user
    user.is_scholar = False
    user.save(update_fields=["is_scholar"])
    profile.delete()
    return Response({"success": True, "message": f"Scholar {user.username} rejected and profile removed."})


# ------------------------------------------------------------------ #
#  GET /api/auth/admin/reports/
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_list_reports(request):
    from apps.interactions.models import VideoReport

    qs = VideoReport.objects.select_related("user", "video", "video__scholar").order_by("-created_at")
    paginator = AdminPagination()
    page = paginator.paginate_queryset(qs, request)
    data = [
        {
            "id":             r.id,
            "reporter":       r.user.username,
            "video_id":       r.video.id,
            "video_title":    r.video.title,
            "video_scholar":  r.video.scholar.display_name,
            "reason":         r.reason,
            "description":    r.description,
            "created_at":     r.created_at.isoformat(),
        }
        for r in page
    ]
    return paginator.get_paginated_response(data)


# ------------------------------------------------------------------ #
#  DELETE /api/auth/admin/videos/<id>/remove/
# ------------------------------------------------------------------ #
@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def admin_remove_video(request, pk):
    from apps.videos.models import Video

    try:
        video = Video.objects.get(pk=pk)
    except Video.DoesNotExist:
        return Response({"success": False, "message": "Video not found."}, status=404)

    title = video.title
    video.delete()
    return Response({"success": True, "message": f'Video "{title}" removed.'})
