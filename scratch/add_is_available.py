from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE trainers ADD COLUMN is_available BOOLEAN DEFAULT TRUE;"))
        conn.commit()
        print("Successfully added is_available column to trainers table.")
    except Exception as e:
        print(f"Error: {e}")
