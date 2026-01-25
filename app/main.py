from app import models, routers
from app.database import engine, Base
from fastapi import FastAPI

app = FastAPI(title="JS Mentor Backend")

# Create all tables in the database
models.Base.metadata.create_all(bind=engine)

#Include Rooutes
app.include_router(routers.auth.router)
# app.include_router(routers.users.router)

@app.get("/")
async def read_root():
    return {"message": "Greetings from JS Mentor Servers!"}