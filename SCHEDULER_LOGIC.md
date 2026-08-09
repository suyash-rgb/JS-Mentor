# Doubt Session Scheduling Logic

This document outlines the business logic and algorithmic flow for the JS-Mentor Doubt Scheduling Engine. The engine is designed to maximize trainer efficiency through a **Saturation & Dynamic Backfilling** strategy.

## ── Business Rules ──

1.  **Availability**: No doubt sessions are scheduled on **Sundays**.
2.  **Trainer Shifts**: The active window is **10:00 AM – 4:00 PM** (6 hours/day).
3.  **Durations**:
    *   Learning Paths 1 & 2 → **30-minute** sessions.
    *   Learning Paths 3 – 6 → **60-minute** sessions.
4.  **Priority**: Doubts are processed **FIFO** (oldest request first).
5.  **Saturation Strategy**: The engine fills one trainer's schedule completely before assigning tasks to the next available trainer.
6.  **Dynamic Backfilling**: If a session is resolved early or a trainer goes online mid-day, the engine can "tap into" the current time to fill newly available gaps.

---

## ── Algorithmic Flow ──

```mermaid
graph TD
    Start([Start Run]) --> IsSunday{Is it Sunday?}
    
    IsSunday -- Yes --> Reject[Reject & Stop]
    IsSunday -- No --> FetchData[Fetch OPEN Doubts & Available Trainers]
    
    FetchData --> LoopDoubt{For Each <br/> Pending Doubt}
    
    LoopDoubt -- Done --> Commit[Commit Changes & Return Report]
    
    LoopDoubt -- Next --> SortTrainers[Sort Trainers by Booked Minutes DESC <br/> 'Saturation Strategy']
    
    SortTrainers --> PickTrainer[For each Trainer in sorted list]
    
    PickTrainer --> CapacityCheck{Total Booked + New <br/> <= 360 mins?}
    
    CapacityCheck -- No --> NextTrainer[Try Next Trainer]
    
    CapacityCheck -- Yes --> FindSlot{Earliest Free Slot <br/> >= max 10AM, NOW}
    
    FindSlot -- No --> NextTrainer
    
    FindSlot -- Yes --> CreateSession[Create MentorshipSession <br/> Status = 'SCHEDULED']
    CreateSession --> UpdateDoubt[Link Doubt to Session <br/> Status = 'SCHEDULED']
    UpdateDoubt --> LoopDoubt

    NextTrainer --> LoopDoubt
```

---

## ── Optimization Details ──

### 1. Saturation Sorting
Instead of spreading the load (Load Balancing), we sort trainers by their already booked minutes in **descending** order. This ensures that the engine tries to "top up" the trainer who is already working, keeping other trainers free unless necessary.

### 2. Dynamic "Now" Floor
When searching for an available slot (`_next_free_slot`), the engine uses `max(SESSION_START, CURRENT_TIME)`. This allows for **immediate scheduling** of new doubts into the current day's gaps, rather than waiting for the next day.

### 3. Reactive Triggers
The engine doesn't just run on a schedule. It is reactively triggered when:
*   A **Student** registers a new doubt.
*   A **Trainer** marks a session as resolved (freeing up their remaining time).

---

## ── Group Class Timing Constraints ──
In addition to the dynamic doubt-scheduling queue, the backend automates the scheduling of standard daily group cohort lectures (in `cohort_service.py`):
1. **Timing Slots**: Classes are systematically scheduled at fixed, post-4 PM UTC slots to optimize learner attendance and fit standard trainer shifts:
   * **Slot 1**: 16:00 UTC (4:00 PM)
   * **Slot 2**: 17:00 UTC (5:00 PM)
   * **Slot 3**: 18:00 UTC (6:00 PM)
2. **Trainer Assignment Rules**: The script loops over all cohorts managed by a specific trainer. Cohorts are sequentially mapped to Slot 1, Slot 2, and Slot 3. If a trainer manages more than three cohorts, the remaining cohorts fallback to Slot 3 (18:00 UTC).
3. **Idempotent Ingestion**: Before creating a class instance, the service verifies if a `GroupClass` entry already exists for that cohort on the current date, avoiding duplicate bookings.

---

## ── Data Schema ──

*   **Trainer**: `is_available` (Boolean) - Manual toggle for trainers to participate in the queue.
*   **Doubt**: `status` ('OPEN', 'SCHEDULED', 'RESOLVED').
*   **MentorshipSession**: `status` ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED').