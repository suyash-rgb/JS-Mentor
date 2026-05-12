from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class LinkCreate(BaseModel):
    text: str
    url: str
    pageContent: Optional[Dict[str, Any]] = Field(default_factory=dict)

class LearningPathCreate(BaseModel):
    heading: str
    content: str
    links: Optional[List[LinkCreate]] = Field(default_factory=list)

class LearningPathUpdate(BaseModel):
    heading: Optional[str] = None
    content: Optional[str] = None
    links: Optional[List[LinkCreate]] = None
