import os
import httpx
from fastapi import HTTPException, Request, status
from pydantic import BaseModel

GROQ_API_KEY = os.getenv("FASTAPI_GROK_API_KEY")
GROQ_URL = os.getenv("FASTAPI_GROK_API_URL")
GROQ_MODEL = os.getenv("FASTAPI_GROK_MODEL")

class AIQuery(BaseModel):
    input_text: str

class ExplainErrorQuery(BaseModel):
    code: str
    error_message: str

async def ask_ai(request: Request, query: AIQuery):
    if not GROQ_API_KEY or not GROQ_URL:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI Service configuration (URL or Key) is missing on the server."
        )

    payload = {
        "model": GROQ_MODEL,
        "input": f"You are a JavaScript expert assistant. Answer the following JavaScript-related question clearly and helpfully:\n\n{query.input_text}"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=45.0  # Slightly longer timeout for AI generation
            )
            
            # Log for debugging (visible in your terminal)
            print(f"AI Provider Status: {response.status_code}")
            
            if response.status_code != 200:
                # This will help us catch if the API provider is unhappy with the payload
                error_detail = response.text
                print(f"AI Provider Error Body: {error_detail}")
                raise HTTPException(status_code=response.status_code, detail="Server Error")

            data = response.json()

            # EXACT PARSING LOGIC FROM YOUR REACT COMPONENT:
            # Look for the 'output' array and find the 'message' type item
            generated_text = "No response generated"
            
            if "output" in data and isinstance(data["output"], list):
                message_obj = next(
                    (item for item in data["output"] if item.get("type") == "message"), 
                    None
                )
                if message_obj and "content" in message_obj and len(message_obj["content"]) > 0:
                    generated_text = message_obj["content"][0].get("text", "No text found")

            return {"response": generated_text}

        except httpx.ReadTimeout:
            raise HTTPException(status_code=504, detail="Something went wrong. Please try again.")
        except Exception as e:
            print(f"Backend Wrapper Crash: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

async def explain_error(request: Request, query: ExplainErrorQuery):
    """
    Backend wrapper for the Compiler's 'Explain Error' feature.
    """
    if not GROQ_API_KEY or not GROQ_URL:
        raise HTTPException(status_code=500, detail="AI Config missing")

    # Detailed System Prompt defined on the backend (Security + Consistency)
    prompt = (
        f"You are a JavaScript expert. Explain this error briefly to a beginner. "
        f"Do NOT use tables. Provide a short explanation and the corrected code snippet only.\n\n"
        f"BUGGY CODE:\n{query.code}\n\n"
        f"CONSOLE ERROR:\n{query.error_message}"
    )

    payload = {
        "model": GROQ_MODEL,
        "input": prompt
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                json=payload,
                timeout=45.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="AI Provider Error")

            data = response.json()
            generated_text = "I hit a snag analyzing the code."
            
            # Use your established parsing logic
            if "output" in data and isinstance(data["output"], list):
                message_obj = next((item for item in data["output"] if item.get("type") == "message"), None)
                if message_obj and "content" in message_obj:
                    generated_text = message_obj["content"][0].get("text", generated_text)

            return {"response": generated_text}

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

async def infer_learning_path_index(topic: str) -> int:
    """
    Uses the AI provider to infer the learning path index based on the doubt topic.
    """
    if not GROQ_API_KEY or not GROQ_URL:
        return 1

    prompt = (
        "You are an intelligent router for a JavaScript course. "
        "Your job is to match a student's doubt topic to the correct learning path index.\n"
        "Here are the available learning paths and their indexes:\n"
        "1: Fundamentals (e.g. basics, variables, loops)\n"
        "2: JavaScript Core (e.g. closures, promises, DOM, AJAX)\n"
        "3: Frontend Frameworks (e.g. React, Angular, State, UI)\n"
        "4: Node.js (e.g. Express, backend, middleware, API, database)\n"
        "5: Full-Stack Architecture (e.g. GraphQL, microservices, scaling)\n"
        "6: Technologies and Trends (e.g. PWA, WebAssembly, ML)\n\n"
        f"Student Doubt Topic: '{topic}'\n\n"
        "Reply with ONLY the integer index (1, 2, 3, 4, 5, or 6) that best fits the topic. Do not include any other text."
    )

    payload = {
        "model": GROQ_MODEL,
        "input": prompt
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                json=payload,
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                if "output" in data and isinstance(data["output"], list):
                    message_obj = next((item for item in data["output"] if item.get("type") == "message"), None)
                    if message_obj and "content" in message_obj:
                        text_result = message_obj["content"][0].get("text", "").strip()
                        import re
                        match = re.search(r'\d', text_result)
                        if match:
                            index = int(match.group())
                            if 1 <= index <= 6:
                                return index
        except Exception:
            pass
            
    return 1
