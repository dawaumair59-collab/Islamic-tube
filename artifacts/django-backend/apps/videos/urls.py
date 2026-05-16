from django.urls import path
from . import views

urlpatterns = [
    path("",                      views.list_videos,   name="video-list"),
    path("upload/",               views.upload_video,  name="video-upload"),
    path("my-videos/",            views.my_videos,     name="video-my-videos"),
    path("pending/",              views.pending_videos, name="video-pending"),
    path("<int:pk>/",             views.video_detail,  name="video-detail"),
    path("<int:pk>/update/",      views.update_video,  name="video-update"),
    path("<int:pk>/approve/",     views.approve_video, name="video-approve"),
    path("<int:pk>/reject/",      views.reject_video,  name="video-reject"),
]
