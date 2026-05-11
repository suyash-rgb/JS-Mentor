from pydantic import BaseModel
from typing import Optional

class VideoBase(BaseModel):
    title: str
    url: str

class VideoCreate(VideoBase):
    pass

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None

class Video(VideoBase):
    id: str
