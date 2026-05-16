from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from apps.videos.models import Video
from apps.interactions.models import Like, Comment
from apps.subscriptions.models import Subscription
from .models import Notification


def _bulk_notify(recipients, sender, notification_type, title, message, video=None):
    """Create notifications for multiple recipients, skipping the sender."""
    objs = [
        Notification(
            recipient=r,
            sender=sender,
            notification_type=notification_type,
            title=title,
            message=message,
            video=video,
        )
        for r in recipients
        if r != sender
    ]
    if objs:
        Notification.objects.bulk_create(objs, ignore_conflicts=True)


# ── Video uploaded → notify all subscribers of that scholar ──────────────────
@receiver(post_save, sender=Video)
def on_video_saved(sender, instance, created, **kwargs):
    if not created:
        # Status changed to approved
        if instance.status == Video.STATUS_APPROVED:
            Notification.objects.get_or_create(
                recipient=instance.scholar,
                notification_type=Notification.TYPE_VIDEO_APPROVED,
                video=instance,
                defaults={
                    "sender": None,
                    "title": "Video Approved",
                    "message": f'Your video "{instance.title}" has been approved and is now live.',
                },
            )
            # Notify subscribers that a new video is available
            subscribers = list(
                instance.scholar.subscribers.values_list("subscriber", flat=True)
            )
            from django.contrib.auth import get_user_model
            User = get_user_model()
            recipient_users = User.objects.filter(pk__in=subscribers)
            scholar_name = instance.scholar.full_name or instance.scholar.username
            _bulk_notify(
                recipients=recipient_users,
                sender=instance.scholar,
                notification_type=Notification.TYPE_NEW_VIDEO,
                title="New Video",
                message=f'{scholar_name} uploaded "{instance.title}".',
                video=instance,
            )

        elif instance.status == Video.STATUS_REJECTED:
            Notification.objects.get_or_create(
                recipient=instance.scholar,
                notification_type=Notification.TYPE_VIDEO_REJECTED,
                video=instance,
                defaults={
                    "sender": None,
                    "title": "Video Not Approved",
                    "message": f'Your video "{instance.title}" was not approved.',
                },
            )
    return


# ── New like → notify the video scholar ──────────────────────────────────────
@receiver(post_save, sender=Like)
def on_like_created(sender, instance, created, **kwargs):
    if not created:
        return
    video = instance.video
    if video.scholar == instance.user:
        return
    liker_name = instance.user.full_name or instance.user.username
    Notification.objects.create(
        recipient=video.scholar,
        sender=instance.user,
        notification_type=Notification.TYPE_NEW_LIKE,
        title="New Like",
        message=f'{liker_name} liked your video "{video.title}".',
        video=video,
    )


# ── New comment → notify the video scholar ───────────────────────────────────
@receiver(post_save, sender=Comment)
def on_comment_created(sender, instance, created, **kwargs):
    if not created:
        return
    video = instance.video
    if video.scholar == instance.user:
        return
    commenter_name = instance.user.full_name or instance.user.username
    Notification.objects.create(
        recipient=video.scholar,
        sender=instance.user,
        notification_type=Notification.TYPE_NEW_COMMENT,
        title="New Comment",
        message=f'{commenter_name} commented on "{video.title}": {instance.text[:80]}',
        video=video,
    )


# ── New subscription → notify the scholar ────────────────────────────────────
@receiver(post_save, sender=Subscription)
def on_subscription_created(sender, instance, created, **kwargs):
    if not created:
        return
    subscriber_name = instance.subscriber.full_name or instance.subscriber.username
    Notification.objects.create(
        recipient=instance.scholar,
        sender=instance.subscriber,
        notification_type=Notification.TYPE_NEW_SUBSCRIBER,
        title="New Subscriber",
        message=f'{subscriber_name} subscribed to your channel.',
    )
