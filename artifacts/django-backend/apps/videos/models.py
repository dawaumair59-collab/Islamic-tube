from django.db import models
from django.conf import settings


class Video(models.Model):
    STATUS_PENDING  = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"

    STATUS_CHOICES = [
        (STATUS_PENDING,  "Pending Review"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    TYPE_LONG  = "long"
    TYPE_SHORT = "short"

    TYPE_CHOICES = [
        (TYPE_LONG,  "Long Video"),
        (TYPE_SHORT, "Short"),
    ]

    CATEGORY_CHOICES = [
        ("quran",        "Quran & Tafsir"),
        ("fiqh",         "Fiqh & Islamic Law"),
        ("seerah",       "Seerah & History"),
        ("aqeedah",      "Aqeedah & Theology"),
        ("hadith",       "Hadith & Sciences"),
        ("spirituality", "Spirituality & Tazkiyah"),
        ("family",       "Family & Lifestyle"),
        ("finance",      "Islamic Finance"),
        ("dawah",        "Dawah & Education"),
        ("other",        "Other"),
    ]

    VISIBILITY_CHOICES = [
        ("public",    "Public"),
        ("unlisted",  "Unlisted"),
        ("private",   "Private"),
    ]

    scholar       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="videos",
        limit_choices_to={"is_scholar": True},
    )
    title         = models.CharField(max_length=200)
    description   = models.TextField(blank=True)
    category      = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")
    video_type    = models.CharField(max_length=10, choices=TYPE_CHOICES, default=TYPE_LONG)
    video_url     = models.URLField(max_length=500)
    thumbnail_url = models.URLField(max_length=500, blank=True)
    duration      = models.PositiveIntegerField(default=0, help_text="Duration in seconds")
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    visibility    = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default="public")
    view_count    = models.PositiveIntegerField(default=0)
    like_count    = models.PositiveIntegerField(default=0)
    tags          = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    rejection_reason = models.TextField(blank=True)
    approved_by   = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_videos",
    )
    approved_at   = models.DateTimeField(null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "videos"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "category"]),
            models.Index(fields=["scholar", "status"]),
            models.Index(fields=["video_type", "status"]),
        ]

    def __str__(self):
        return f"[{self.status.upper()}] {self.title}"

    def increment_views(self):
        Video.objects.filter(pk=self.pk).update(view_count=models.F("view_count") + 1)
        self.refresh_from_db(fields=["view_count"])
