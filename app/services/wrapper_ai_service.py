import os
import httpx
from fastapi import HTTPException, Request, status
from pydantic import BaseModel

GROQ_API_KEY = os.getenv("FASTAPI_GROK_API_KEY")
GROQ_URL = os.getenv("FASTAPI_GROK_API_URL")
GROQ_MODEL = os.getenv("FASTAPI_GROK_MODEL")


class AIQuery(BaseModel):
    input_text: str

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