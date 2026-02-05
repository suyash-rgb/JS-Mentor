from app import models, routers
from app.database import engine, Base
from app.routers import trainer
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

#Include Rooutes
app.include_router(routers.auth.router)
# app.include_router(routers.users.router)
app.include_router(trainer.router)
app.include_router(routers.test.router)

@app.get("/")
async def read_root():
    return {"message": "Greetings from JS Mentor Servers!"}
