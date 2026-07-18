from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import uuid
from datetime import datetime

from app.schemas.blog import BlogCreate, BlogResponse
from app.services import curriculum_service
from app.dependencies import require_trainer

router = APIRouter(prefix="/blogs", tags=["Blogs"])

@router.get("/", response_model=List[BlogResponse])
async def get_all_blogs():
    data = curriculum_service.load_data()
    return data.get("blogs", [])

@router.post("/", response_model=BlogResponse, status_code=status.HTTP_201_CREATED)
async def create_blog(blog: BlogCreate, current_user = Depends(require_trainer)):
    data = curriculum_service.load_data()
    if "blogs" not in data:
        data["blogs"] = []
    
    new_blog = {
        "id": str(uuid.uuid4()),
        "title": blog.title,
        "content": blog.content,
        "author": blog.author,
        "imageUrl": blog.imageUrl,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    data["blogs"].append(new_blog)
    curriculum_service.save_data(data)
    
    return new_blog

@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog(blog_id: str, current_user = Depends(require_trainer)):
    data = curriculum_service.load_data()
    blogs = data.get("blogs", [])
    
    blog_to_delete = next((b for b in blogs if b["id"] == blog_id), None)
    if not blog_to_delete:
        raise HTTPException(status_code=404, detail="Blog not found")
        
    data["blogs"] = [b for b in blogs if b["id"] != blog_id]
    curriculum_service.save_data(data)
    
    return None
