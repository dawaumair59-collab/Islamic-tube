from rest_framework import serializers
from apps.videos.serializers import VideoListSerializer
from .models import Like, Comment, VideoReport


class LikedVideoSerializer(serializers.ModelSerializer):
    video = VideoListSerializer(read_only=True)
    liked_at = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model  = Like
        fields = ["id", "video", "liked_at"]


class CommentSerializer(serializers.ModelSerializer):
    username   = serializers.CharField(source="user.username",      read_only=True)
    full_name  = serializers.CharField(source="user.full_name",     read_only=True)
    avatar_url = serializers.CharField(source="user.avatar_url",    read_only=True)

    class Meta:
        model  = Comment
        fields = [
            "id", "text",
            "username", "full_name", "avatar_url",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "username", "full_name", "avatar_url", "created_at", "updated_at"]

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Comment cannot be empty.")
        if len(value) > 2000:
            raise serializers.ValidationError("Comment cannot exceed 2000 characters.")
        return value

    def create(self, validated_data):
        return Comment.objects.create(
            user=self.context["request"].user,
            video=self.context["video"],
            **validated_data,
        )


class VideoReportSerializer(serializers.ModelSerializer):
    class Meta:
        model  = VideoReport
        fields = ["reason", "description"]

    def validate_reason(self, value):
        valid = [r[0] for r in VideoReport.REASON_CHOICES]
        if value not in valid:
            raise serializers.ValidationError(f"Must be one of: {', '.join(valid)}")
        return value

    def create(self, validated_data):
        return VideoReport.objects.create(
            user=self.context["request"].user,
            video=self.context["video"],
            **validated_data,
        )
