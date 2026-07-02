from sqlalchemy import text
from app.database import engine

def main():
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE curriculum_notes MODIFY content LONGTEXT;"))
            print("Successfully altered curriculum_notes table!")
    except Exception as e:
        print(f"Failed to alter table: {e}")

if __name__ == "__main__":
    main()
