import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add app directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base
from app.models.student import Student
from app.models.learning import StudentProgress
from app.services.ml_service import MLService

# Test Database
DATABASE_URL = "sqlite:///./test_ml.db"
engine = create_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create test students
    s1 = Student(name="Qualified Student", phone_no="1234567890")
    s2 = Student(name="Unqualified Student", phone_no="0987654321")
    db.add_all([s1, s2])
    db.commit()
    
    # Define qualified topics (must match some from data.json)
    # Card 1 (Fundamentals) topics: /js, /jsb, /sue, /gsj, /vac, /oae, /cf, /fas, /oao, /ehd
    # Card 2 (JS Core) topics: /cc, /pa, /eh, /dom, /mdj, /afa
    
    q_topics = ["/js", "/jsb", "/sue", "/gsj", "/vac", "/oae", "/cf", "/fas", "/oao", "/ehd", 
                "/cc", "/pa", "/eh", "/dom", "/mdj", "/afa"]
    
    # S1 completes all
    for t in q_topics:
        db.add(StudentProgress(student_id=s1.id, topic_id=t, status='COMPLETED'))
        
    # S2 completes only some
    db.add(StudentProgress(student_id=s2.id, topic_id="/js", status='COMPLETED'))
    db.add(StudentProgress(student_id=s2.id, topic_id="/cc", status='COMPLETED'))
    
    db.commit()
    return db

def test_ml_filtering():
    db = setup_test_db()
    try:
        print("Checking qualified students...")
        qualified_ids = MLService._get_qualified_student_ids(db)
        print(f"Qualified Student IDs: {qualified_ids}")
        
        # S1 has ID 1, S2 has ID 2
        # Note: We need to make sure MLService is reading the real data.json
        # which might have more topics than our test list.
        
        import json
        with open("data.json", 'r', encoding='utf-8') as f:
            data = json.load(f)
            real_q_topics = []
            for i in [0, 1]:
                for link in data['cards'][i]['links']:
                    real_q_topics.append(link['url'])
        
        print(f"Total topics required in first 2 paths: {len(real_q_topics)}")
        
        # Let's add the missing topics to S1 to make them truly qualified
        student1 = db.query(Student).filter_by(name="Qualified Student").first()
        existing_topics = [p.topic_id for p in student1.progress_records]
        for t in real_q_topics:
            if t not in existing_topics:
                db.add(StudentProgress(student_id=student1.id, topic_id=t, status='COMPLETED'))
        db.commit()
        
        qualified_ids = MLService._get_qualified_student_ids(db)
        print(f"Updated Qualified Student IDs: {qualified_ids}")
        
        if student1.id in qualified_ids:
            print("SUCCESS: Student 1 is correctly identified as qualified.")
        else:
            print("FAILURE: Student 1 NOT identified as qualified.")
            
        if 2 not in qualified_ids:
            print("SUCCESS: Student 2 is correctly identified as unqualified.")
        else:
            print("FAILURE: Student 2 incorrectly identified as qualified.")

    finally:
        db.close()
        if os.path.exists("./test_ml.db"):
            os.remove("./test_ml.db")

if __name__ == "__main__":
    test_ml_filtering()
