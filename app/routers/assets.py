from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import assets as assets_service
from app.dependencies import get_current_clerk_student, require_trainer, get_any_user

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.post("/generate-signature", summary="Generate a Cloudinary signed upload signature")
async def generate_signature(folder: str, user=Depends(get_any_user)):
    """
    Generate a signature for Cloudinary direct uploads.
    Delegates business logic to the asset service.
    """
    return assets_service.generate_signature(folder)

@router.delete("/cleanup/{session_id}", summary="Manually trigger cleanup of session assets")
async def cleanup_assets(session_id: int, background_tasks: BackgroundTasks, trainer=Depends(require_trainer), db: Session = Depends(get_db)):
    """
    Hook to clean up a specific session's Cloudinary folder.
    This can also be triggered directly from the trainer dashboard when a doubt is resolved.
    """
    folder_path = f"js-mentor/sessions/{session_id}"
    background_tasks.add_task(cleanup_cloudinary_folder, folder_path)
    return {"message": f"Cleanup for {folder_path} started in background"}
