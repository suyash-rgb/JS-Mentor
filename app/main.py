from app import models
from app.database import engine, Base
from fastapi import FastAPI

app = FastAPI()

# Create all tables in the database
models.Base.metadata.create_all(bind=engine)

@app.get("/")
async def read_root():
    return {"message": "Greetings from JS Mentor Servers!"}