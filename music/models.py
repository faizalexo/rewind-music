from django.db import models


class Playlist(models.Model):

    title = models.CharField(
        max_length=200
    )

    subtitle = models.CharField(
        max_length=300,
        blank=True
    )

    description = models.TextField(
        blank=True
    )

    cover_image = models.ImageField(
        upload_to="playlists/",
        blank=True,
        null=True
    )

    background_image = models.ImageField(
        upload_to="backgrounds/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return self.title
    
    
    
class Song(models.Model):

    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE,
        related_name="songs"
    )

    title = models.CharField(
        max_length=200
    )

    artist = models.CharField(
        max_length=200,
        default="Unknown Artist"
    )

    album = models.CharField(
        max_length=200,
        blank=True
    )

    audio_file = models.FileField(
        upload_to="songs/"
    )

    cover_image = models.ImageField(
        upload_to="covers/",
        blank=True,
        null=True
    )

    track_number = models.PositiveIntegerField(
        default=1
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = [
            "track_number",
            "created_at"
        ]

    def __str__(self):
        return self.title    