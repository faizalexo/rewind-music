import os
import mimetypes
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client


# Load .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise RuntimeError("SUPABASE_URL or SUPABASE_SERVICE_KEY missing in .env")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY
)

BUCKET = "media"

# media folder is one level above backend
MEDIA_ROOT = Path(__file__).resolve().parent.parent / "media"

folders = [
    "songs",
    "covers",
    "playlists",
    "backgrounds",
]

total = 0
success = 0
failed = 0

for folder in folders:

    folder_path = MEDIA_ROOT / folder

    if not folder_path.exists():
        print(f"SKIP: {folder_path}")
        continue

    files = [
        f for f in folder_path.rglob("*")
        if f.is_file()
    ]

    print(f"\n========== {folder.upper()} ==========")
    print(f"Files: {len(files)}")

    for file_path in files:

        relative_path = file_path.relative_to(MEDIA_ROOT)
        storage_path = str(relative_path).replace("\\", "/")

        mime_type, _ = mimetypes.guess_type(str(file_path))

        if not mime_type:
            mime_type = "application/octet-stream"

        try:

            with open(file_path, "rb") as file:

                supabase.storage.from_(BUCKET).upload(
                    storage_path,
                    file,
                    file_options={
                        "content-type": mime_type,
                        "upsert": "true",
                    },
                )

            success += 1
            total += file_path.stat().st_size

            size_mb = file_path.stat().st_size / (1024 * 1024)

            print(f"OK   {storage_path} ({size_mb:.2f} MB)")

        except Exception as e:

            failed += 1

            print(f"FAIL {storage_path}")
            print(f"     {e}")


print("\n===================================")
print("UPLOAD COMPLETE")
print(f"Successful : {success}")
print(f"Failed     : {failed}")
print(f"Uploaded   : {total / (1024 * 1024):.2f} MB")
print("===================================")