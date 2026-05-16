from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ScholarProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "username", "full_name", "is_scholar", "is_active", "date_joined"]
    list_filter = ["is_scholar", "is_active", "is_staff"]
    search_fields = ["email", "username", "full_name"]
    ordering = ["-date_joined"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("username", "full_name", "avatar_url", "bio")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "is_scholar", "groups", "user_permissions")}),
        ("Dates", {"fields": ("date_joined", "last_login")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "full_name", "password1", "password2"),
        }),
    )


@admin.register(ScholarProfile)
class ScholarProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "expertise", "institution", "verified", "subscriber_count", "created_at"]
    list_filter = ["expertise", "verified"]
    search_fields = ["user__email", "user__username", "institution"]
    list_editable = ["verified"]
    ordering = ["-created_at"]
