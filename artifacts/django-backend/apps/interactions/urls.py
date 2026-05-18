from django.urls import path
from . import views

urlpatterns = [
    # ── Likes ────────────────────────────────────────────────────── #
    path("likes/my-likes/",              views.my_liked_videos,   name="my-liked-videos"),
    path("videos/<int:pk>/like/",        views.like_video,        name="video-like"),
    path("videos/<int:pk>/unlike/",      views.unlike_video,      name="video-unlike"),

    # ── Comments ─────────────────────────────────────────────────── #
    path("videos/<int:pk>/comments/",    views.video_comments,    name="video-comments"),
    path("comments/<int:pk>/",           views.delete_comment,    name="comment-delete"),

    # ── Reports ──────────────────────────────────────────────────── #
    path("videos/<int:pk>/report/",      views.report_video,      name="video-report"),

    # ── Watch history ────────────────────────────────────────────── #
    path("watch-history/",               views.watch_history_list, name="watch-history-list"),
    path("watch-history/<int:pk>/",      views.watch_history_add,  name="watch-history-add"),

    # ── Saved videos ─────────────────────────────────────────────── #
    path("saved/",                       views.saved_list,         name="saved-list"),
    path("saved/<int:pk>/",              views.saved_toggle,       name="saved-toggle"),
    path("saved/<int:pk>/status/",       views.saved_status,       name="saved-status"),

    # ── Playlists ────────────────────────────────────────────────── #
    path("playlists/",                                           views.playlist_list,    name="playlist-list"),
    path("playlists/<int:pk>/",                                  views.playlist_detail,  name="playlist-detail"),
    path("playlists/<int:pk>/videos/<int:video_pk>/",            views.playlist_video,   name="playlist-video"),

    # ── Comment replies ──────────────────────────────────────────── #
    path("comments/<int:pk>/replies/",   views.comment_replies,   name="comment-replies"),
    path("replies/<int:pk>/",            views.delete_reply,      name="reply-delete"),

    # ── Live chat (polling) ──────────────────────────────────────── #
    path("live-chat/<str:room>/messages/", views.live_chat_messages, name="live-chat-messages"),
]
