 # Load .env BEFORE importing modules that use environment variables

from app import models, routers
from app.database import engine, Base
from app.routers import trainer, ml_router, analytics, scheduling
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse


app = FastAPI(title="JS Mentor Backend")

# defining allowed origins for CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1.3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers (including Authorization for JWT)
)

# Create all tables in the database
models.Base.metadata.create_all(bind=engine)

@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    # Determine the message based on the endpoint path
    path = request.url.path
    
    if "domain-specialized-assistant" in path:
        message = "You are querying too fast, please slow down for better learning! 🚀"
    elif "explain-error" in path:
        message = "Slow down! Let's analyze this error carefully before moving to the next one. 🧐"
    else:
        message = "Too many requests. Please wait a moment."
    return JSONResponse(
        status_code=429,
        content={"detail": "You are querying too fast, please slow down for better learning! 🚀"}
    )

#Include Rooutes
app.include_router(routers.auth.router)
# app.include_router(routers.users.router)
app.include_router(trainer.router)
# app.include_router(routers.test.router)
app.include_router(ml_router.router)
app.include_router(analytics.router)
app.include_router(scheduling.router, prefix="/api/v1")
app.include_router(routers.curriculum.router)
app.include_router(routers.wrapper_ai.router)


@app.get("/")
async def read_root():
    return {"message": "Greetings from JS Mentor Servers!"}

# async def smart_rate_limit_handler(request: Request, exc: RateLimitExceeded):
#     # Determine the message based on the endpoint path
#     path = request.url.path
    
#     if "domain-specialized-assistant" in path:
#         message = "You are querying too fast, please slow down for better learning! 🚀"
#     elif "explain-error" in path:
#         message = "Slow down! Let's analyze this error carefully before moving to the next one. 🧐"
#     else:
#         message = "Too many requests. Please wait a moment."

#     return JSONResponse(
#         status_code=429,
#         content={"detail": message}
#     )

# app.add_exception_handler(RateLimitExceeded, smart_rate_limit_handler)