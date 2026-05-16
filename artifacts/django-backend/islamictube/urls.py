from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/",         include("apps.core.urls")),
    path("api/auth/",           include("apps.accounts.urls")),
    path("api/videos/",         include("apps.videos.urls")),
    path("api/search/",         include("apps.search.urls")),
    path("api/subscriptions/",  include("apps.subscriptions.urls")),
    path("api/",                include("apps.interactions.urls")),
    path("api/notifications/",  include("apps.notifications.urls")),
]
