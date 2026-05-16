from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from .models import Video


class VideoListSerializer(serializers.ModelSerializer):
    scholar_name = serializers.CharField(source="scholar.display_name", read_only=True)
    scholar_username = serializers.CharField(source="scholar.username", read_only=True)
    duration_display = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            "id", "title", "thumbnail_url", "video_type",
            "category", "duration", "duration_display",
            "view_count", "like_count",
            "scholar_name", "scholar_username",
            "created_at",
        ]

    def get_duration_display(self, obj):
        secs = obj.duration
        m, s = divmod(secs, 60)
        h, m = divmod(m, 60)
        if h:
            return f"{h}:{m:02d}:{s:02d}"
        return f"{m}:{s:02d}"


class VideoDetailSerializer(serializers.ModelSerializer):
    scholar = UserSerializer(read_only=True)
    duration_display = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            "id", "title", "description", "video_url", "thumbnail_url",
            "video_type", "category", "visibility",
            "duration", "duration_display",
            "status", "view_count", "like_count",
            "tags", "tags_list",
            "scholar", "created_at", "updated_at",
        ]

    def get_duration_display(self, obj):
        secs = obj.duration
        m, s = divmod(secs, 60)
        h, m = divmod(m, 60)
        if h:
            return f"{h}:{m:02d}:{s:02d}"
        return f"{m}:{s:02d}"

    def get_tags_list(self, obj):
        if not obj.tags:
            return []
        return [t.strip() for t in obj.tags.split(",") if t.strip()]


class VideoUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = [
            "title", "description", "category", "video_type",
            "video_url", "thumbnail_url", "duration",
            "visibility", "tags",
        ]

    def validate_video_url(self, value):
        if not value:
            raise serializers.ValidationError("Video URL is required.")
        return value

    def validate(self, attrs):
        video_type = attrs.get("video_type", Video.TYPE_LONG)
        duration   = attrs.get("duration", 0)
        if video_type == Video.TYPE_SHORT and duration > 60:
            raise serializers.ValidationError(
                {"duration": "Short videos must be 60 seconds or less."}
            )
        return attrs

    def create(self, validated_data):
        scholar = self.context["request"].user
        return Video.objects.create(scholar=scholar, status=Video.STATUS_PENDING, **validated_data)


class VideoUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = [
            "title", "description", "category",
            "thumbnail_url", "visibility", "tags",
        ]


class AdminStatusSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
