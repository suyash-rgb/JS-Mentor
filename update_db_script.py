from app.database import SessionLocal
from app.models.learning import ExerciseEvaluation

db = SessionLocal()

try:
    # Update all mock submissions to use actual IDs from data.json
    evals = db.query(ExerciseEvaluation).all()
    for i, evaluation in enumerate(evals):
        if i % 2 == 0:
            evaluation.exercise_id = '102'
        else:
            evaluation.exercise_id = '103'
    db.commit()
    print("Successfully updated exercise IDs in database.")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
