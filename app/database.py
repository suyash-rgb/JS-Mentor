import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Format: postgresql://user:password@host:port/database_name
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Render/Heroku provide URLs starting with "postgres://", but SQLAlchemy 1.4+ 
# requires "postgresql://". We fix this here.
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

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