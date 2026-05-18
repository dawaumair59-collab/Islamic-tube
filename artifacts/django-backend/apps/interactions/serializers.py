from rest_framework import serializers
from apps.videos.serializers import VideoListSerializer
from .models import Like, Comment, VideoReport, WatchHistory, SavedVideo


class LikedVideoSerializer(serializers.ModelSerializer):
    video    = VideoListSerializer(read_only=True)
    liked_at = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model  = Like
        fields = ["id", "video", "liked_at"]


class CommentSerializer(serializers.ModelSerializer):
    username   = serializers.CharField(source="user.username",   read_only=True)
    full_name  = serializers.CharField(source="user.full_name",  read_only=True)
    avatar_url = serializers.CharField(source="user.avatar_url", read_only=True)
    user_id    = serializers.IntegerField(source="user.id",      read_only=True)

    class Meta:
        model  = Comment
        fields = [
            "id", "text",
            "username", "full_name", "avatar_url", "user_id",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "username", "full_name", "avatar_url", "user_id",
            "created_at", "updated_at",
        ]

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


class WatchHistorySerializer(serializers.ModelSerializer):
    video      = VideoListSerializer(read_only=True)
    watched_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model  = WatchHistory
        fields = ["id", "video", "watched_at"]


class SavedVideoSerializer(serializers.ModelSerializer):
    video    = VideoListSerializer(read_only=True)
    saved_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model  = SavedVideo
        fields = ["id", "video", "saved_at"]


class CommentReplySerializer(serializers.ModelSerializer):
    username   = serializers.CharField(source="user.username",   read_only=True)
    full_name  = serializers.CharField(source="user.full_name",  read_only=True)
    avatar_url = serializers.CharField(source="user.avatar_url", read_only=True)
    user_id    = serializers.IntegerField(source="user.id",      read_only=True)

    class Meta:
        model  = __import__("apps.interactions.models", fromlist=["CommentReply"]).CommentReply
        fields = ["id", "text", "username", "full_name", "avatar_url", "user_id", "created_at"]
        read_only_fields = ["id", "username", "full_name", "avatar_url", "user_id", "created_at"]

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Reply cannot be empty.")
        return value

    def create(self, validated_data):
        return __import__("apps.interactions.models", fromlist=["CommentReply"]).CommentReply.objects.create(
            user=self.context["request"].user,
            comment=self.context["comment"],
            **validated_data,
        )


class PlaylistSerializer(serializers.ModelSerializer):
    video_count = serializers.SerializerMethodField()
    thumbnail   = serializers.SerializerMethodField()

    class Meta:
        model  = __import__("apps.interactions.models", fromlist=["Playlist"]).Playlist
        fields = ["id", "title", "description", "video_count", "thumbnail", "created_at", "updated_at"]
        read_only_fields = ["id", "video_count", "thumbnail", "created_at", "updated_at"]

    def get_video_count(self, obj):
        return obj.videos.count()

    def get_thumbnail(self, obj):
        first = obj.videos.select_related().first()
        if first and first.thumbnail_url:
            return first.thumbnail_url
        return None

    def create(self, validated_data):
        return __import__("apps.interactions.models", fromlist=["Playlist"]).Playlist.objects.create(
            user=self.context["request"].user,
            **validated_data,
        )
