from django.contrib import admin
from .models import Like, Comment


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display  = ["user", "video", "created_at"]
    list_filter   = ["created_at"]
    search_fields = ["user__username", "video__title"]
    ordering      = ["-created_at"]
    readonly_fields = ["created_at"]
    list_per_page = 50


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display  = ["user", "video", "short_text", "created_at"]
    list_filter   = ["created_at"]
    search_fields = ["user__username", "video__title", "text"]
    ordering      = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]
    list_per_page = 50

    @admin.display(description="Comment")
    def short_text(self, obj):
        return obj.text[:80] + ("…" if len(obj.text) > 80 else "")
