from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer, CreateNotificationSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def notification_list(request):
    if request.method == "GET":
        notifications = Notification.objects.filter(
            recipient=request.user
        ).select_related("sender", "video")[:50]

        unread_count = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).count()

        serializer = NotificationSerializer(notifications, many=True)
        return Response({
            "success": True,
            "unread_count": unread_count,
            "count": len(serializer.data),
            "notifications": serializer.data,
        })

    # POST — create a notification (staff/admin only)
    if not request.user.is_staff:
        return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

    serializer = CreateNotificationSerializer(data=request.data)
    if serializer.is_valid():
        notification = serializer.save()
        return Response(
            NotificationSerializer(notification).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def unread_count(request):
    count = Notification.objects.filter(
        recipient=request.user, is_read=False
    ).count()
    return Response({"unread_count": count})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_as_read(request, pk):
    try:
        notification = Notification.objects.get(pk=pk, recipient=request.user)
    except Notification.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    notification.is_read = True
    notification.save(update_fields=["is_read"])
    return Response(NotificationSerializer(notification).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    updated = Notification.objects.filter(
        recipient=request.user, is_read=False
    ).update(is_read=True)
    return Response({"success": True, "updated": updated})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_notification(request, pk):
    try:
        notification = Notification.objects.get(pk=pk, recipient=request.user)
    except Notification.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    notification.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
