from datetime import datetime, date, time, timezone
from sqlalchemy.orm import Session
from sqlalchemy import cast, Date
from app.models.cohort import Cohort, GroupClass, GroupClassStatus
from app.models.student import Student
from app.models.trainer import Trainer

async def auto_assign_students_fcfs(db: Session, max_capacity: int = 10):
    # 0. Self-healing check: Unassign any excess students from overflowing cohorts (> max_capacity)
    # This repairs cohorts that were overfilled by previous un-flushed loop runs.
    existing_cohorts = db.query(Cohort).order_by(Cohort.id.asc()).all()
    for c in existing_cohorts:
        students_in_cohort = db.query(Student).filter(Student.cohort_id == c.id).order_by(Student.id.asc()).all()
        if len(students_in_cohort) > max_capacity:
            for excess_student in students_in_cohort[max_capacity:]:
                excess_student.cohort_id = None
                db.add(excess_student)
    db.flush()

    # 1. Fetch all unassigned students in FCFS order (Student.id ASC)
    unassigned_students = db.query(Student).filter(Student.cohort_id == None).order_by(Student.id.asc()).all()
    if not unassigned_students:
        return

    # 2. Fetch all trainers in FCFS order (Trainer.id ASC)
    trainers = db.query(Trainer).order_by(Trainer.id.asc()).all()
    if not trainers:
        print("Warning: No trainers found to assign students to cohorts.")
        return

    # 3. Maintain in-memory cohort counts and flush after each assignment so autoflush=False does not mask capacity
    cohorts = db.query(Cohort).order_by(Cohort.id.asc()).all()
    cohort_counts = {c.id: db.query(Student).filter(Student.cohort_id == c.id).count() for c in cohorts}

    for student in unassigned_students:
        assigned = False

        for cohort in cohorts:
            if cohort_counts.get(cohort.id, 0) < max_capacity:
                student.cohort_id = cohort.id
                cohort_counts[cohort.id] = cohort_counts.get(cohort.id, 0) + 1
                db.add(student)
                db.flush()
                assigned = True
                break

        if not assigned:
            # Need to create a new cohort for a trainer.
            # Pick the trainer with the fewest cohorts, breaking ties by earliest trainer (Trainer.id ASC)
            trainer_cohort_counts = []
            for trainer in trainers:
                count = sum(1 for c in cohorts if c.trainer_id == trainer.id)
                trainer_cohort_counts.append((count, trainer.id, trainer))

            trainer_cohort_counts.sort(key=lambda x: (x[0], x[1]))

            best_trainer = trainer_cohort_counts[0][2]
            best_trainer_cohort_count = trainer_cohort_counts[0][0]

            new_cohort_name = f"Cohort #{best_trainer_cohort_count + 1} - {best_trainer.name}"
            new_cohort = Cohort(
                name=new_cohort_name,
                trainer_id=best_trainer.id
            )
            db.add(new_cohort)
            db.flush()

            cohorts.append(new_cohort)
            cohort_counts[new_cohort.id] = 1

            student.cohort_id = new_cohort.id
            db.add(student)
            db.flush()

    db.commit()

async def ensure_today_classes_scheduled(db: Session, trainer_id: int):
    # Get all cohorts owned by the trainer in order
    cohorts = db.query(Cohort).filter(Cohort.trainer_id == trainer_id).order_by(Cohort.id.asc()).all()
    if not cohorts:
        return

    today = date.today()
    trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    trainer_name = trainer.name if trainer else "Mentor"
    
    # 4:00 PM, 5:00 PM, 6:00 PM (16:00, 17:00, 18:00)
    slot_times = [
        datetime.combine(today, time(16, 0)),
        datetime.combine(today, time(17, 0)),
        datetime.combine(today, time(18, 0))
    ]
    
    for idx, cohort in enumerate(cohorts):
        # Determine the time slot for this cohort index (default to the last slot if trainer has > 3 cohorts)
        slot_time = slot_times[min(idx, len(slot_times) - 1)]
        
        # Check if today's class is already scheduled for this cohort
        existing_class = db.query(GroupClass).filter(
            GroupClass.cohort_id == cohort.id,
            cast(GroupClass.scheduled_for, Date) == today
        ).first()
        
        if existing_class:
            if existing_class.scheduled_for.hour < 16:
                existing_class.scheduled_for = slot_time
                db.add(existing_class)
                db.commit()
            continue

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
