from django.urls import path
from . import views

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
]
