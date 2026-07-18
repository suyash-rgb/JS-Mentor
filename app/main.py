 # Load .env BEFORE importing modules that use environment variables

from app import models, routers
from app.database import engine, Base
from app.routers import trainer, ml_router, student, scheduling, assets
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
import logging
from datetime import date
from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.database import SessionLocal
from app.services.scheduler import run_scheduling_engine
from app.services.assets import cleanup_ghost_folders
import cloudinary
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SchedulingAutomation")

# Initialize Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def automated_scheduling_job():
    logger.info("Triggered APScheduler cron job for doubt scheduling...")
    db = SessionLocal()
    try:
        from datetime import timedelta
        target_date = date.today()
        for i in range(7):
            result = run_scheduling_engine(db, target_date)
            logger.info(f"APScheduler day {i} finished. Scheduled: {len(result.scheduled)}, Skipped: {len(result.skipped)}")
            if result.errors:
                logger.warning(f"Scheduler warnings on day {i}: {result.errors}")
            target_date += timedelta(days=1)
    except Exception as e:
        logger.error(f"Error in automated scheduling job: {e}", exc_info=True)
    finally:
        db.close()

scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting APScheduler for daily background tasks...")
    scheduler.add_job(
        automated_scheduling_job,
        CronTrigger(hour=10, minute=0),
        id="daily_doubt_scheduler",
        replace_existing=True
    )
    scheduler.add_job(
        cleanup_ghost_folders,
        CronTrigger(hour=0, minute=0),
        id="ghost_folder_cleanup",
        replace_existing=True
    )
    # Create all tables in the database during startup
    models.Base.metadata.create_all(bind=engine)
    scheduler.start()
    yield
    # Shutdown
    logger.info("Shutting down APScheduler...")
    scheduler.shutdown()

from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI(title="JS Mentor Backend", lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=500)

# defining allowed origins for CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    # Ensure there's no trailing slash, as browsers send Origin without it
    origins.append(frontend_url.strip().rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r".*", # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers.signaling import signaling_app
app.mount("/ws/socket.io", signaling_app)

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
app.include_router(trainer.router, prefix="/api/v1")
app.include_router(ml_router.router)
app.include_router(student.router, prefix="/api/v1")
app.include_router(scheduling.router, prefix="/api/v1")
app.include_router(routers.curriculum.router, prefix="/api/v1")
app.include_router(routers.wrapper_ai.router)
app.include_router(assets.router)
from app.routers import chat
app.include_router(chat.router)


@app.get("/")
async def read_root():
    return {"message": "Greetings from JS Mentor Servers!"}

