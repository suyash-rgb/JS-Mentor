from fastapi import APIRouter, FastAPI, Query, HTTPException
from fastapi.responses import RedirectResponse

router = APIRouter(prefix="/test", tags=["Test"])

#simulate mapping of strings
keyword_map = {
    "docs": "https://fastapi.tiangolo.com/",
    "github": "https://github.com/suyash-rgb/JS-Mentor.git",
    "search": "https://www.google.com",
    }

@router.get("/redirect")
async def redirect_to_url(q: str = Query(..., description="Keyword to redirect to a specific URL")):
    
    if q in keyword_map:
        target_url = keyword_map[q]
        return RedirectResponse(url=target_url, status_code=302)
    else:
        raise HTTPException(status_code=404, detail="Keyword not found")
    
""" Similar logic can be used to redirecting to the urls in data.json when heading is passed as query parameter.

This logic can be used for the "Continue" feature in the frontend(dashboard).

Since the headings are unique, we can map the headings to their respective urls and redirect the user accordingly.

Also there is another constraint in this case since we want separate states to be maintained for distinct learning paths.
Hence we need to associate path name string to the heading-url mapping.

For eg: if the user is learning "Frontend Development" path and he/she clicks on "Continue" for a particular exercise, 
he/she should be redirected to the url associated with that heading in the "Frontend Development" path only.

"""