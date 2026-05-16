from django.urls import path
from . import views
from . import admin_views

urlpatterns = [
    # ---- Auth ----
    path("register/",       views.register,      name="auth-register"),
    path("login/",          views.login,         name="auth-login"),
    path("logout/",         views.logout,        name="auth-logout"),
    path("token/refresh/",  views.token_refresh, name="auth-token-refresh"),

    # ---- Profile ----
    path("me/",             views.me,             name="auth-me"),
    path("me/update/",      views.update_profile, name="auth-me-update"),

    # ---- Scholar ----
    path("scholar/register/", views.scholar_register, name="scholar-register"),
    path("scholars/",         views.list_scholars,    name="scholar-list"),

    # ---- Admin ----
    path("admin/stats/",                          admin_views.admin_stats,            name="admin-stats"),
    path("admin/users/",                          admin_views.admin_list_users,       name="admin-users"),
    path("admin/users/<int:pk>/ban/",             admin_views.admin_ban_user,         name="admin-ban-user"),
    path("admin/scholars/",                       admin_views.admin_list_scholars,    name="admin-scholars"),
    path("admin/scholars/<int:pk>/verify/",       admin_views.admin_verify_scholar,   name="admin-verify-scholar"),
    path("admin/scholars/<int:pk>/reject/",       admin_views.admin_reject_scholar,   name="admin-reject-scholar"),
    path("admin/reports/",                        admin_views.admin_list_reports,     name="admin-reports"),
    path("admin/videos/<int:pk>/remove/",         admin_views.admin_remove_video,     name="admin-remove-video"),
]
