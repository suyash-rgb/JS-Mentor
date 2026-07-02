from app.database import SessionLocal
from app.models.learning import CurriculumNote

def test_fetch():
    db = SessionLocal()
    try:
        note = db.query(CurriculumNote).filter(CurriculumNote.path_id == "Technologies and Trends").first()
        if note:
            print("Successfully fetched note!")
            print("Content length:", len(note.content))
        else:
            print("Note not found.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error fetching: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_fetch()
