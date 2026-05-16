from django.db import models
from django.conf import settings


class Subscription(models.Model):
    subscriber = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    scholar = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscribers",
        limit_choices_to={"is_scholar": True},
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "subscriptions"
        unique_together = ["subscriber", "scholar"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["subscriber"]),
            models.Index(fields=["scholar"]),
        ]

    def __str__(self):
        return f"{self.subscriber.username} → {self.scholar.username}"
