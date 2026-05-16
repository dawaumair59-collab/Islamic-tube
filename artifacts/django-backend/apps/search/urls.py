from django.urls import path
from . import views

urlpatterns = [
    path("",              views.search,             name="search"),
    path("suggestions/",  views.search_suggestions,  name="search-suggestions"),
    path("trending/",     views.trending_searches,   name="search-trending"),
]
