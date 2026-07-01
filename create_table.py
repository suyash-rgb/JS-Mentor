import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from app.models.learning import CurriculumNote

def create_tables():
    CurriculumNote.metadata.create_all(bind=engine)
    print("CurriculumNote table created successfully.")

if __name__ == "__main__":
    create_tables()
