import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def upload_video_large(file_stream, filename):
    """
    Uploads a large video file to Cloudinary.
    """
    try:
        result = cloudinary.uploader.upload_large(
            file_stream,
            resource_type="video",
            folder="js_mentor/videos",
            public_id=filename.split('.')[0], # Use filename without extension as public_id
            chunk_size=6000000, # 6MB chunks
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return None
