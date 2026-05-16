from django.db import models
from django.conf import settings


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
        return f"{self.user.username} ♥ {self.video.title}"


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
