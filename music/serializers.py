from rest_framework import serializers
from .models import Playlist, Song
from django.conf import settings


class SongSerializer(serializers.ModelSerializer):

    audio_url = serializers.SerializerMethodField()
    cover_url = serializers.SerializerMethodField()

    class Meta:
        model = Song

        fields = [
            "id",
            "title",
            "artist",
            "album",
            "audio_url",
            "cover_url",
            "track_number",
        ]

    def get_audio_url(self, obj):

        if not obj.audio_file:
            return None

        filename = obj.audio_file.name.split("/")[-1]

        supabase_url = settings.SUPABASE_URL

        return (
            f"{supabase_url}/storage/v1/object/public/"
            f"media/songs/{filename}"
        )

    def get_cover_url(self, obj):

        if not obj.cover_image:
            return None

        filename = obj.cover_image.name.split("/")[-1]

        supabase_url = settings.SUPABASE_URL

        return (
            f"{supabase_url}/storage/v1/object/public/"
            f"media/covers/{filename}"
        )

class PlaylistSerializer(serializers.ModelSerializer):

    cover_url = serializers.SerializerMethodField()
    background_url = serializers.SerializerMethodField()

    songs = SongSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Playlist

        fields = [
            "id",
            "title",
            "subtitle",
            "description",
            "cover_url",
            "background_url",
            "songs",
        ]

    def get_cover_url(self, obj):

        if not obj.cover_image:
            return None

        filename = obj.cover_image.name.split("/")[-1]

        supabase_url = settings.SUPABASE_URL

        return (
            f"{supabase_url}/storage/v1/object/public/"
            f"media/playlists/{filename}"
        )

    def get_background_url(self, obj):

        if not obj.background_image:
            return None

        filename = obj.background_image.name.split("/")[-1]

        supabase_url = settings.SUPABASE_URL

        return (
            f"{supabase_url}/storage/v1/object/public/"
            f"media/backgrounds/{filename}"
        )