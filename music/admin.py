from django.contrib import admin

from .models import Playlist, Song


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "subtitle",
        "created_at",
    )


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):

    list_display = (
        "track_number",
        "title",
        "artist",
        "playlist",
    )

    list_filter = (
        "playlist",
    )

    search_fields = (
        "title",
        "artist",
        "album",
    )