import pytest
import os
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.student import Student
from app.models.learning import StudentProgress
from app.services.ml_service import MLService

from sqlalchemy.pool import StaticPool

DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_ml_filtering(db_session):
    db = db_session
    
    # Create test students
    s1 = Student(name="Qualified Student", phone_no="1234567890")
    s2 = Student(name="Unqualified Student", phone_no="0987654321")
    db.add_all([s1, s2])
    db.commit()
    
    # S2 completes only some
    db.add(StudentProgress(student_id=s2.id, topic_id="/js", status='COMPLETED'))
    db.add(StudentProgress(student_id=s2.id, topic_id="/cc", status='COMPLETED'))
    db.commit()

    # Read required topics from data.json to make S1 fully qualified
    with open("data.json", 'r', encoding='utf-8') as f:
        data = json.load(f)
        real_q_topics = []
        for i in [0, 1]:
            for link in data['cards'][i]['links']:
                real_q_topics.append(link['url'])
                
    for t in real_q_topics:
        db.add(StudentProgress(student_id=s1.id, topic_id=t, status='COMPLETED'))
    db.commit()
    
    qualified_ids = MLService._get_qualified_student_ids(db)
    
    assert s1.id in qualified_ids, "Student 1 should be identified as qualified"
    assert s2.id not in qualified_ids, "Student 2 should be identified as unqualified"
