from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    sender_name       = serializers.SerializerMethodField()
    sender_avatar     = serializers.SerializerMethodField()
    sender_username   = serializers.SerializerMethodField()
    video_thumbnail   = serializers.SerializerMethodField()
    video_title       = serializers.SerializerMethodField()

    class Meta:
        model  = Notification
        fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "is_read",
            "created_at",
            "sender_name",
            "sender_avatar",
            "sender_username",
            "video_thumbnail",
            "video_title",
            "video",
        ]
        read_only_fields = ["id", "created_at", "is_read"]

    def get_sender_name(self, obj):
        if obj.sender:
            return obj.sender.full_name or obj.sender.username
        return "IslamicTube"

    def get_sender_avatar(self, obj):
        if obj.sender:
            return obj.sender.avatar_url or None
        return None

    def get_sender_username(self, obj):
        if obj.sender:
            return obj.sender.username
        return None

    def get_video_thumbnail(self, obj):
        if obj.video:
            return obj.video.thumbnail_url or None
        return None

    def get_video_title(self, obj):
        if obj.video:
            return obj.video.title
        return None


class CreateNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = [
            "recipient",
            "sender",
            "notification_type",
            "title",
            "message",
            "video",
        ]
