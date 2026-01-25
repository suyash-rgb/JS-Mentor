import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Format: mysql://user:password@host:port/database_name
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Create the MySQL engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,  # Helps handle "MySQL server has gone away" errors
    pool_recycle=3600    # Reconnects every hour to avoid idle timeouts
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()