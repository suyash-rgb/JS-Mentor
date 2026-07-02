from app.database import SessionLocal
from app.services.curriculum_service import upsert_curriculum_note
from app.schemas.curriculum_note import CurriculumNoteUpsert

def test_insert():
    db = SessionLocal()
    try:
        large_string = "A" * 350000
        note_data = CurriculumNoteUpsert(content=large_string)
        upsert_curriculum_note("test_path_123", note_data, db)
        print("Insert successful!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error during insert: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_insert()
