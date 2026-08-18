from rest_framework import viewsets
from django.shortcuts import render
from .models import Playlist, Song
from .serializers import PlaylistSerializer, SongSerializer
from django.shortcuts import render
import mimetypes
import os
from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse
from django.views.decorators.http import require_GET
from django.shortcuts import redirect


def home(request):
    return render(
        request,
        "playlist_select.html"
    )
    
    
def playlist_page(request, playlist_id):
    return render(
        request,
        "music_player.html",
        {
            "playlist_id": playlist_id
        }
    )  
class PlaylistViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Playlist.objects.prefetch_related(
        "songs"
    )

    serializer_class = PlaylistSerializer

    def get_serializer_context(self):

        return {
            "request": self.request
        }


class SongViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Song.objects.all()

    serializer_class = SongSerializer

    def get_serializer_context(self):

        return {
            "request": self.request
        }
        

@require_GET
def serve_song(request, filename):

    supabase_url = os.getenv("SUPABASE_URL")

    if not supabase_url:
        raise Http404("Supabase URL not configured")

    song_url = (
        f"{supabase_url}/storage/v1/object/public/"
        f"media/songs/{filename}"
    )

    return redirect(song_url)

    # ==========================================
    # RANGE REQUEST
    # ==========================================

    try:

        if not range_header.startswith("bytes="):
            raise ValueError

        range_value = range_header[6:]

        start_str, end_str = (
            range_value.split("-", 1)
        )

        # Start provided
        if start_str:

            start = int(start_str)

        # Suffix range: bytes=-500000
        else:

            suffix_length = int(end_str)

            start = max(
                0,
                file_size - suffix_length
            )

        # End provided
        if end_str:

            end = int(end_str)

        else:

            end = file_size - 1

        start = max(
            0,
            start
        )

        end = min(
            end,
            file_size - 1
        )

        if start > end:
            raise ValueError

    except (
        ValueError,
        TypeError
    ):

        response = HttpResponse(
            status=416
        )

        response["Content-Range"] = (
            f"bytes */{file_size}"
        )

        return response

    content_length = (
        end - start + 1
    )

    file = open(
        file_path,
        "rb"
    )

    file.seek(start)

    response = FileResponse(
        file,
        status=206,
        content_type=content_type
    )

    response["Accept-Ranges"] = "bytes"

    response["Content-Range"] = (
        f"bytes {start}-{end}/{file_size}"
    )

    response["Content-Length"] = str(
        content_length
    )

    return response