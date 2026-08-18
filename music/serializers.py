from rest_framework import serializers

from .models import Playlist, Song


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

       request = self.context.get(
        "request"
       )

       if not obj.audio_file:
        return None

       url = (
        f"/api/stream/song/"
        f"{obj.audio_file.name.split('/')[-1]}/"
        )

       if request:
        return request.build_absolute_uri(
            url
        )

       return url

    def get_cover_url(self, obj):

        request = self.context.get("request")

        if not obj.cover_image:
            return None

        url = obj.cover_image.url

        if request:
            return request.build_absolute_uri(url)

        return url


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

        request = self.context.get("request")

        if not obj.cover_image:
            return None

        url = obj.cover_image.url

        if request:
            return request.build_absolute_uri(url)

        return url

    def get_background_url(self, obj):

        request = self.context.get("request")

        if not obj.background_image:
            return None

        url = obj.background_image.url

        if request:
            return request.build_absolute_uri(url)

        return url