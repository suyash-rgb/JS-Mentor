graph TD
    Start([Start Run]) --> IsSunday{Is it Sunday?}
    
    IsSunday -- Yes --> Reject[Reject & Stop]
    IsSunday -- No --> FetchData[Fetch Pending Doubts & Active Trainers]
    
    FetchData --> CalcTime[Calculate Trainer Capacity <br/> 360 - already_booked_minutes]
    CalcTime --> SortTrainers[Sort Trainers: Most Free Time First]
    
    SortTrainers --> LoopDoubt{For Each <br/> Pending Doubt}
    
    LoopDoubt -- Done --> Report([Return Scheduling Report])
    
    LoopDoubt -- Next --> PickTrainer[Pick Trainer with Most Remaining Time]
    PickTrainer --> FindSlot{Available Slot Found? <br/> 10:00 AM - 4:00 PM}
    
    FindSlot -- Yes --> Update[Create Schedule Block <br/> Status = 'SCHEDULED']
    FindSlot -- No --> Skip[Leave Doubt as 'PENDING' <br/> for next day]
    
    Update --> LoopDoubt
    Skip --> LoopDoubt

    style Reject fill:#f8d7da,stroke:#f5c6cb
    style IsSunday fill:#fff3cd,stroke:#ffeeba
    style Update fill:#d4edda,stroke:#c3e6cb