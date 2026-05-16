from django.contrib import admin
from django.db.models import Count
from .models import SearchLog


@admin.register(SearchLog)
class SearchLogAdmin(admin.ModelAdmin):
    list_display  = ["query", "user", "created_at"]
    list_filter   = ["created_at"]
    search_fields = ["query", "user__username"]
    ordering      = ["-created_at"]
    readonly_fields = ["query", "user", "created_at"]
    list_per_page = 50
