from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (PlaylistViewSet, playlist_page,SongViewSet,serve_song)


router = DefaultRouter()

router.register(
    "playlists",
    PlaylistViewSet,
    basename="playlist"
)


router.register(
    "songs",
    SongViewSet,
    basename="song"
)

urlpatterns = [

    path(
        "playlist/<int:playlist_id>/",
        playlist_page,
        name="playlist-page"
    ),
     path(
        "stream/song/<str:filename>/",
        serve_song,
        name="stream-song"
    ),

] + router.urls