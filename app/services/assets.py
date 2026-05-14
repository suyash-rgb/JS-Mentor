import cloudinary
import cloudinary.api
import cloudinary.utils
import cloudinary.search
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.interaction import Doubt
import time
from datetime import datetime, timedelta

import logging

logger = logging.getLogger("AssetService")

def cleanup_cloudinary_folder(folder_path: str):
    """Deletes a folder and all its resources from Cloudinary."""
    if not folder_path:
        return
    try:
        # Delete resources first (Cloudinary requirement)
        cloudinary.api.delete_resources_by_prefix(folder_path)
        # Then delete the folder
        cloudinary.api.delete_folder(folder_path)
        logger.info(f"Successfully cleaned up Cloudinary folder: {folder_path}")
    except Exception as e:
        logger.error(f"Error cleaning up folder {folder_path}: {e}")

def cleanup_ghost_folders():
    """
    Finds folders in js-mentor/sessions/ that have resources older than 24 hours
    and are not linked to an active doubt, then deletes them.
    """
    db = SessionLocal()
    try:
        # Get all active doubt folders from the database
        # An active doubt is one that is not RESOLVED
        active_doubts = db.query(Doubt).filter(
            Doubt.status.in_(['OPEN', 'SCHEDULED']),
            Doubt.cloudinary_folder != None
        ).all()
        active_folders = {d.cloudinary_folder for d in active_doubts if d.cloudinary_folder}

        # Search Cloudinary for resources older than 24h in the sessions folder
        # '1d' means 1 day ago
        search_result = cloudinary.search.Search()\
            .expression('folder=js-mentor/sessions/* AND uploaded_at<1d')\
            .max_results(500)\
            .execute()
            
        resources = search_result.get('resources', [])
        
        folders_to_delete = set()
        for res in resources:
            folder = res.get('folder')
            if folder and folder not in active_folders:
                folders_to_delete.add(folder)
                
        for folder in folders_to_delete:
            logger.info(f"Ghost folder cleanup: Deleting {folder}")
            cleanup_cloudinary_folder(folder)
            
    except Exception as e:
        logger.error(f"Error in ghost folder cleanup: {e}")
    finally:
        db.close()

def generate_signature(folder: str):
    """
    Business logic for generating Cloudinary upload signatures.
    Validates folder paths and handles signature creation.
    """
    if not folder.startswith("js-mentor/sessions/"):
        raise HTTPException(status_code=400, detail="Invalid folder path. Must start with 'js-mentor/sessions/'")

    try:
        timestamp = int(time.time())
        params_to_sign = {
            "folder": folder,
            "timestamp": timestamp,
        }
        
        signature = cloudinary.utils.api_sign_request(
            params_to_sign, 
            cloudinary.config().api_secret
        )

        return {
            "timestamp": timestamp,
            "signature": signature,
            "cloud_name": cloudinary.config().cloud_name,
            "api_key": cloudinary.config().api_key,
            "folder": folder
        }
    except Exception as e:
        logger.error(f"Failed to generate Cloudinary signature: {e}")
        raise HTTPException(
            status_code=500, 
            detail="External storage service failure. Please try again later."
        )
