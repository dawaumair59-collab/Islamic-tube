from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_NEW_VIDEO      = "new_video"
    TYPE_NEW_SUBSCRIBER = "new_subscriber"
    TYPE_VIDEO_APPROVED = "video_approved"
    TYPE_VIDEO_REJECTED = "video_rejected"
    TYPE_NEW_COMMENT    = "new_comment"
    TYPE_NEW_LIKE       = "new_like"

    TYPE_CHOICES = [
        (TYPE_NEW_VIDEO,      "New Video"),
        (TYPE_NEW_SUBSCRIBER, "New Subscriber"),
        (TYPE_VIDEO_APPROVED, "Video Approved"),
        (TYPE_VIDEO_REJECTED, "Video Rejected"),
        (TYPE_NEW_COMMENT,    "New Comment"),
        (TYPE_NEW_LIKE,       "New Like"),
    ]

    recipient         = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    sender            = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="sent_notifications",
    )
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title             = models.CharField(max_length=200)
    message           = models.CharField(max_length=500)
    video             = models.ForeignKey(
        "videos.Video",
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name="notifications",
    )
    is_read           = models.BooleanField(default=False)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "is_read"]),
            models.Index(fields=["recipient", "created_at"]),
        ]

    def __str__(self):
        return f"[{self.notification_type}] → {self.recipient.username}"
