import os
import sys
import logging
from datetime import date

# Ensure the project root is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.services.scheduler import run_scheduling_engine

# Configure robust logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger("SchedulingAutomation")

def main():
    logger.info("Starting automated doubt session scheduling...")
    
    db = SessionLocal()
    try:
        target_date = date.today()
        logger.info(f"Running scheduler for target date: {target_date}")
        
        result = run_scheduling_engine(db, target_date)
        
        scheduled_count = len(result.scheduled)
        skipped_count = len(result.skipped)
        
        logger.info(f"Scheduling engine completed. Scheduled: {scheduled_count}, Skipped: {skipped_count}")
        
        if result.errors:
            logger.warning("The scheduling engine reported the following errors/messages:")
            for err in result.errors:
                logger.warning(f" - {err}")
                
        if scheduled_count > 0:
            logger.info("Successfully scheduled sessions:")
            for s in result.scheduled:
                logger.info(f" - Doubt {s.get('doubt_id')} -> Trainer {s.get('trainer_name')} at {s.get('scheduled_for')}")
                
        if skipped_count > 0:
            logger.info("Skipped doubts:")
            for s in result.skipped:
                logger.info(f" - Doubt {s.get('doubt_id')}: {s.get('reason', 'Unknown reason')}")
                
    except Exception as e:
        logger.error(f"An unexpected error occurred during scheduling: {e}", exc_info=True)
        sys.exit(1)
    finally:
        db.close()
        logger.info("Automated scheduling finished.")

if __name__ == "__main__":
    main()
