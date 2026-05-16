from rest_framework import serializers
from apps.accounts.models import User
from apps.videos.models import Video
from apps.videos.serializers import VideoListSerializer
from .models import Subscription


class ScholarSubscriptionSerializer(serializers.ModelSerializer):
    subscriber_count = serializers.SerializerMethodField()
    subscribed_at    = serializers.SerializerMethodField()
    is_subscribed    = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = [
            "id", "username", "full_name", "avatar_url",
            "bio", "subscriber_count", "subscribed_at", "is_subscribed",
        ]

    def get_subscriber_count(self, obj):
        return obj.subscribers.count()

    def get_subscribed_at(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        sub = Subscription.objects.filter(
            subscriber=request.user, scholar=obj
        ).first()
        return sub.created_at.isoformat() if sub else None

    def get_is_subscribed(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Subscription.objects.filter(
            subscriber=request.user, scholar=obj
        ).exists()
