from sqlalchemy import text
from app.database import engine

def main():
    try:
        with engine.begin() as conn:
            result = conn.execute(text("DESCRIBE curriculum_notes;"))
            for row in result:
                print(row)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
