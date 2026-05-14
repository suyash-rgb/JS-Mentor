from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
import cloudinary.utils
from app.dependencies import get_current_clerk_student, require_trainer, get_any_user
import time
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.assets import cleanup_cloudinary_folder

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.post("/generate-signature", summary="Generate a Cloudinary signed upload signature")
async def generate_signature(folder: str, user=Depends(get_any_user)):
    """
    Generate a signature for Cloudinary direct uploads.
    The folder path should be like 'js-mentor/sessions/{session_id}'.
    """
    if not folder.startswith("js-mentor/sessions/"):
        raise HTTPException(status_code=400, detail="Invalid folder path")

    timestamp = int(time.time())
    # Signature valid for 10 minutes (600 seconds)
    # Note: Cloudinary signatures are generally valid for 1 hour by default for uploads,
    # but we can pass 'expiration' to enforce a strict limit if needed, though 'timestamp' is used to validate how old the signature is.
    params_to_sign = {
        "folder": folder,
        "timestamp": timestamp,
    }
    
    try:
        signature = cloudinary.utils.api_sign_request(params_to_sign, cloudinary.config().api_secret)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate signature: {str(e)}")

    return {
        "timestamp": timestamp,
        "signature": signature,
        "cloud_name": cloudinary.config().cloud_name,
        "api_key": cloudinary.config().api_key,
        "folder": folder
    }

@router.delete("/cleanup/{session_id}", summary="Manually trigger cleanup of session assets")
async def cleanup_assets(session_id: int, background_tasks: BackgroundTasks, trainer=Depends(require_trainer), db: Session = Depends(get_db)):
    """
    Hook to clean up a specific session's Cloudinary folder.
    This can also be triggered directly from the trainer dashboard when a doubt is resolved.
    """
    folder_path = f"js-mentor/sessions/{session_id}"
    background_tasks.add_task(cleanup_cloudinary_folder, folder_path)
    return {"message": f"Cleanup for {folder_path} started in background"}
