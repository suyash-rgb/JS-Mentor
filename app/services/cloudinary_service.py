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

def extract_public_id(url: str):
    """
    Extracts the public_id from a Cloudinary URL.
    """
    try:
        parts = url.split("/upload/")
        if len(parts) < 2:
            return None
        
        path_parts = parts[1].split("/")
        if path_parts[0].startswith("v") and path_parts[0][1:].isdigit():
            path_parts = path_parts[1:]
            
        full_path = "/".join(path_parts)
        public_id = full_path.rsplit(".", 1)[0]
        return public_id
    except Exception as e:
        print(f"Error extracting public_id: {e}")
        return None

def delete_video(url: str):
    """
    Deletes a video from Cloudinary given its secure URL.
    """
    if not url or "res.cloudinary.com" not in url:
        return True
        
    public_id = extract_public_id(url)
    if not public_id:
        return False
        
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type="video")
        return result.get("result") in ["ok", "not found"]
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
        return False
