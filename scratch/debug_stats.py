from app.database import SessionLocal
from app.services import trainer_service

db = SessionLocal()
try:
    stats = trainer_service.get_cohort_stats(db)
    print("Stats:", stats)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
