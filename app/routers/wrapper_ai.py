from fastapi import APIRouter, Request, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.services.wrapper_ai_service import ask_ai as ask_ai_service, AIQuery
from app.services.wrapper_ai_service import explain_error as explain_error_service, ExplainErrorQuery

# Setup Limiter (using the same instance logic we discussed)
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/ai", tags=["AI Wrapper"])

@router.post("/js-mentor/explain-error")
@limiter.limit("3/minute")
async def explain_error(request: Request, query: ExplainErrorQuery):
    try:
        result = await explain_error_service(request, query)
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Backend Wrapper Crash: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error") 

@router.post("/js-mentor/domain-specialized-assistant")
@limiter.limit("3/minute")
async def consult_ai(request: Request, query: AIQuery):
    """API endpoint for AI consultation - delegates to service layer"""
    try:
        result = await ask_ai_service(request, query)
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Backend Wrapper Crash: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error") 

