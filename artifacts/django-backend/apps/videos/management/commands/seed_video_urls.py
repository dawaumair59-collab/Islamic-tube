"""
Management command: seed_video_urls
Updates all existing videos with real, publicly accessible MP4 URLs
so the video player works end-to-end in development.
"""
from django.core.management.base import BaseCommand
from apps.videos.models import Video

LONG_URLS = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
]

SHORT_URLS = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
]


class Command(BaseCommand):
    help = "Seed existing videos with real, playable MP4 URLs for development/demo"

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Re-seed even if video already has a non-example URL",
        )

    def handle(self, *args, **options):
        force = options["force"]

        long_videos = Video.objects.filter(video_type=Video.TYPE_LONG)
        short_videos = Video.objects.filter(video_type=Video.TYPE_SHORT)

        updated = 0

        for i, video in enumerate(long_videos):
            if not force and video.video_url and "example.com" not in video.video_url:
                continue
            video.video_url = LONG_URLS[i % len(LONG_URLS)]
            video.save(update_fields=["video_url", "updated_at"])
            updated += 1
            self.stdout.write(f"  [long]  {video.title[:50]}")

        for i, video in enumerate(short_videos):
            if not force and video.video_url and "example.com" not in video.video_url:
                continue
            video.video_url = SHORT_URLS[i % len(SHORT_URLS)]
            video.save(update_fields=["video_url", "updated_at"])
            updated += 1
            self.stdout.write(f"  [short] {video.title[:50]}")

        self.stdout.write(
            self.style.SUCCESS(f"\nDone — updated {updated} video URL(s).")
        )
