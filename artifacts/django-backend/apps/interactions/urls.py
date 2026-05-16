from django.urls import path
from . import views

urlpatterns = [
    path("likes/my-likes/",              views.my_liked_videos, name="my-liked-videos"),
    path("videos/<int:pk>/like/",        views.like_video,      name="video-like"),
    path("videos/<int:pk>/unlike/",      views.unlike_video,    name="video-unlike"),
    path("videos/<int:pk>/comments/",    views.video_comments,  name="video-comments"),
    path("comments/<int:pk>/",           views.delete_comment,  name="comment-delete"),
]
