from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class BlogBase(BaseModel):
    title: str
    content: str
    author: str
    imageUrl: Optional[str] = None

class BlogCreate(BlogBase):
    pass

class BlogResponse(BlogBase):
    id: str
    createdAt: str
