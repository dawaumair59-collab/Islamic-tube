from django.db import models
from django.conf import settings


class SearchLog(models.Model):
    query      = models.CharField(max_length=200, db_index=True)
    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="search_logs",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "search_logs"
        ordering = ["-created_at"]

    def __str__(self):
        return self.query
