from django.urls import path
from . import views

urlpatterns = [
    path("",                              views.my_subscriptions, name="subscriptions-list"),
    path("feed/",                         views.subscribed_feed,  name="subscriptions-feed"),
    path("follow/<str:username>/",        views.follow_scholar,   name="scholar-follow"),
    path("unfollow/<str:username>/",      views.unfollow_scholar, name="scholar-unfollow"),
]
