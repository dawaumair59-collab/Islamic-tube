from django.contrib import admin
from .models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display  = ["subscriber", "scholar", "created_at"]
    list_filter   = ["created_at"]
    search_fields = ["subscriber__username", "scholar__username"]
    ordering      = ["-created_at"]
    readonly_fields = ["created_at"]
    list_per_page = 50
