from django.contrib import admin
from django.utils.html import format_html
from .models import Video


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = [
        "title", "scholar", "category", "video_type",
        "status_badge", "view_count", "like_count", "created_at",
    ]
    list_filter  = ["status", "category", "video_type", "visibility"]
    search_fields = ["title", "description", "scholar__username", "scholar__email"]
    ordering     = ["-created_at"]
    readonly_fields = ["view_count", "like_count", "approved_by", "approved_at", "created_at", "updated_at"]
    list_per_page = 30

    fieldsets = (
        ("Content", {
            "fields": ("scholar", "title", "description", "tags"),
        }),
        ("Media", {
            "fields": ("video_url", "thumbnail_url", "duration", "video_type"),
        }),
        ("Classification", {
            "fields": ("category", "visibility"),
        }),
        ("Moderation", {
            "fields": ("status", "rejection_reason", "approved_by", "approved_at"),
        }),
        ("Stats", {
            "fields": ("view_count", "like_count"),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    @admin.display(description="Status")
    def status_badge(self, obj):
        colors = {
            "pending":  "#f59e0b",
            "approved": "#10b981",
            "rejected": "#ef4444",
        }
        color = colors.get(obj.status, "#6b7280")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;'
            'border-radius:12px;font-size:11px;font-weight:600">{}</span>',
            color, obj.status.upper(),
        )

    actions = ["approve_selected", "reject_selected"]

    @admin.action(description="Approve selected videos")
    def approve_selected(self, request, queryset):
        from django.utils import timezone
        updated = queryset.exclude(status="approved").update(
            status="approved",
            approved_by=request.user,
            approved_at=timezone.now(),
        )
        self.message_user(request, f"{updated} video(s) approved.")

    @admin.action(description="Reject selected videos")
    def reject_selected(self, request, queryset):
        updated = queryset.exclude(status="rejected").update(status="rejected")
        self.message_user(request, f"{updated} video(s) rejected.")
