from django.contrib import admin
from django.urls import path, include

from music.views import home, playlist_page

from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [

    path(
        "",
        home,
        name="home"
    ),

    path(
        "playlist/<int:playlist_id>/",
        playlist_page,
        name="playlist-page"
    ),

    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "api/",
        include("music.urls")
    ),
]


if settings.DEBUG:

    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )