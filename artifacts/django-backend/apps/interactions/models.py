from django.db import models
from django.conf import settings
from django.utils import timezone


class Like(models.Model):
    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="likes",
    )
    video      = models.ForeignKey(
        "videos.Video",
        on_delete=models.CASCADE,
        related_name="likes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "likes"
        unique_together = ["user", "video"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["video"]),
        ]

    def __str__(self):
        return f"{self.user.username} liked {self.video.title}"


class Comment(models.Model):
    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    video      = models.ForeignKey(
        "videos.Video",
        on_delete=models.CASCADE,
        related_name="comments",
    )
    text       = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "comments"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["video"]),
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"{self.user.username} on '{self.video.title}': {self.text[:50]}"


class VideoReport(models.Model):
    REASON_CHOICES = [
        ("inappropriate", "Inappropriate Content"),
        ("spam",          "Spam"),
        ("misleading",    "Misleading Information"),
        ("copyright",     "Copyright Violation"),
        ("other",         "Other"),
    ]

    user        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reports",
    )
    video       = models.ForeignKey(
        "videos.Video",
        on_delete=models.CASCADE,
        related_name="reports",
    )
    reason      = models.CharField(max_length=20, choices=REASON_CHOICES, default="other")
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table     = "video_reports"
        unique_together = ["user", "video"]
        ordering     = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} reported '{self.video.title}': {self.reason}"


class WatchHistory(models.Model):
    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="watch_history",
    )
    video      = models.ForeignKey(
        "videos.Video",
        on_delete=models.CASCADE,
        related_name="watch_history",
    )
    watched_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table        = "watch_history"
        unique_together = ["user", "video"]
        ordering        = ["-watched_at"]
        indexes         = [models.Index(fields=["user"])]

    def __str__(self):
        return f"{self.user.username} watched {self.video.title}"


class SavedVideo(models.Model):
    user     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_videos",
    )
    video    = models.ForeignKey(
        "videos.Video",
        on_delete=models.CASCADE,
        related_name="saved_by",
    )
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = "saved_videos"
        unique_together = ["user", "video"]
        ordering        = ["-saved_at"]
        indexes         = [models.Index(fields=["user"])]

    def __str__(self):
        return f"{self.user.username} saved {self.video.title}"


class CommentReply(models.Model):
    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comment_replies",
    )
    comment    = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name="replies",
    )
    text       = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "comment_replies"
        ordering = ["created_at"]
        indexes  = [models.Index(fields=["comment"])]

    def __str__(self):
        return f"{self.user.username} replied to #{self.comment.pk}: {self.text[:50]}"


class Playlist(models.Model):
    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="playlists",
    )
    title      = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    videos     = models.ManyToManyField("videos.Video", blank=True, related_name="playlists")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "playlists"
        ordering = ["-updated_at"]
        indexes  = [models.Index(fields=["user"])]

    def __str__(self):
        return f"{self.user.username}: {self.title}"
