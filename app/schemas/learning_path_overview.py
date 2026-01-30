from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class PageOverview(BaseModel):
    text: str  # The name of the path page
    url: str
    titles: List[str]  # Just the main titles (title1, title3, title4, etc.)
    exercises: List[Dict[str, Any]] = [] # To be populated by our trainer later

class PathOverview(BaseModel):
    heading: str  # Learning path name (e.g., "Fundamentals")
    pages: List[PageOverview]