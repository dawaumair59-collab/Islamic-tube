from rest_framework import serializers
from apps.videos.models import Video
from apps.accounts.models import User


class VideoSearchSerializer(serializers.ModelSerializer):
    scholar_name     = serializers.CharField(source="scholar.display_name", read_only=True)
    scholar_username = serializers.CharField(source="scholar.username",     read_only=True)
    duration_display = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            "id", "title", "thumbnail_url", "video_type",
            "category", "duration", "duration_display",
            "view_count", "scholar_name", "scholar_username",
            "created_at",
        ]

    def get_duration_display(self, obj):
        m, s = divmod(obj.duration, 60)
        h, m = divmod(m, 60)
        return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


class ScholarSearchSerializer(serializers.ModelSerializer):
    subscriber_count = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ["id", "username", "full_name", "avatar_url", "bio", "subscriber_count"]

    def get_subscriber_count(self, obj):
        return obj.subscribers.count()
