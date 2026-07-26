from datetime import datetime, date, time, timezone
from sqlalchemy.orm import Session
from sqlalchemy import cast, Date
from app.models.cohort import Cohort, GroupClass, GroupClassStatus
from app.models.student import Student
from app.models.trainer import Trainer

async def auto_assign_students_fcfs(db: Session, max_capacity: int = 10):
    # 1. Fetch all unassigned students in FCFS order (Student.id ASC)
    unassigned_students = db.query(Student).filter(Student.cohort_id == None).order_by(Student.id.asc()).all()
    if not unassigned_students:
        return

    # 2. Fetch all trainers in FCFS order (Trainer.id ASC)
    trainers = db.query(Trainer).order_by(Trainer.id.asc()).all()
    if not trainers:
        print("Warning: No trainers found to assign students to cohorts.")
        return

    # 3. Process each unassigned student
    for student in unassigned_students:
        # Find existing cohorts that are not full
        cohorts = db.query(Cohort).order_by(Cohort.id.asc()).all()
        assigned = False
        
        for cohort in cohorts:
            student_count = db.query(Student).filter(Student.cohort_id == cohort.id).count()
            if student_count < max_capacity:
                student.cohort_id = cohort.id
                db.add(student)
                assigned = True
                break
                
        if not assigned:
            # Need to create a new cohort for a trainer.
            # Pick the trainer with the fewest cohorts, breaking ties by earliest trainer (Trainer.id ASC)
            trainer_cohort_counts = []
            for trainer in trainers:
                cohort_count = db.query(Cohort).filter(Cohort.trainer_id == trainer.id).count()
                trainer_cohort_counts.append((cohort_count, trainer.id, trainer))
            
            # Sort by cohort count (ASC), then trainer ID (ASC)
            trainer_cohort_counts.sort(key=lambda x: (x[0], x[1]))
            
            best_trainer = trainer_cohort_counts[0][2]
            best_trainer_cohort_count = trainer_cohort_counts[0][0]
            
            # Create new cohort
            new_cohort_name = f"Cohort #{best_trainer_cohort_count + 1} - {best_trainer.name}"
            new_cohort = Cohort(
                name=new_cohort_name,
                trainer_id=best_trainer.id
            )
            db.add(new_cohort)
            db.flush() # Populate the ID
            
            student.cohort_id = new_cohort.id
            db.add(student)
            
    db.commit()

async def ensure_today_classes_scheduled(db: Session, trainer_id: int):
    # Get all cohorts owned by the trainer in order
    cohorts = db.query(Cohort).filter(Cohort.trainer_id == trainer_id).order_by(Cohort.id.asc()).all()
    if not cohorts:
        return

    today = date.today()
    trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    trainer_name = trainer.name if trainer else "Mentor"
    
    # 4:00 PM, 5:00 PM, 6:00 PM IST respectively in UTC
    # 16:00 IST -> 10:30 UTC
    # 17:00 IST -> 11:30 UTC
    # 18:00 IST -> 12:30 UTC
    slot_times_utc = [
        datetime.combine(today, time(10, 30)).replace(tzinfo=timezone.utc),
        datetime.combine(today, time(11, 30)).replace(tzinfo=timezone.utc),
        datetime.combine(today, time(12, 30)).replace(tzinfo=timezone.utc)
    ]
    
    for idx, cohort in enumerate(cohorts):
        # Determine the time slot for this cohort index (default to the last slot if trainer has > 3 cohorts)
        slot_time = slot_times_utc[min(idx, len(slot_times_utc) - 1)]
        
        # Check if today's class is already scheduled for this cohort
        existing_class = db.query(GroupClass).filter(
            GroupClass.cohort_id == cohort.id,
            cast(GroupClass.scheduled_for, Date) == today
        ).first()
        
        if not existing_class:
            # Create a scheduled group class
            new_class = GroupClass(
                cohort_id=cohort.id,
                trainer_id=trainer_id,
                title=f"Daily Concept Review - {cohort.name}",
                topic="Live Interactive Session",
                scheduled_for=slot_time,
                duration_minutes=60,
                status=GroupClassStatus.SCHEDULED
            )
            db.add(new_class)
            db.commit()
            db.refresh(new_class)
            
            # Emit Socket.IO event to all students in this cohort
            try:
                from app.routers.signaling import sio
                # Query all students in this cohort to notify
                students = db.query(Student).filter(Student.cohort_id == cohort.id).all()
                for s in students:
                    await sio.emit("new-group-class-scheduled", {
                        "class_id": new_class.id,
                        "title": new_class.title,
                        "topic": new_class.topic,
                        "scheduled_for": new_class.scheduled_for.isoformat(),
                        "duration_minutes": new_class.duration_minutes,
                        "mentor": trainer_name
                    }, room=f"global_user_{s.user_id}")
            except Exception as e:
                print(f"Failed to emit socket notification for new class: {str(e)}")
