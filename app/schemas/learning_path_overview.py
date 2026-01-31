from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class PageOverview(BaseModel):
    text: str
    titles: List[str]
    exercises: List[Dict[str, Any]] = []    

class PathOverview(BaseModel):
    heading: str  # Learning path name (e.g., "Fundamentals")
    pages: List[PageOverview] 