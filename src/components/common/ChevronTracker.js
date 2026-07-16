import React from 'react';
import './ChevronTracker.css';

function ChevronTracker({ exercises, activeExerciseIndex, setActiveExerciseIndex, isExerciseSolved }) {
  if (!exercises || exercises.length <= 1) return null;

  return (
    <div className="chevron-tracker-scroll-wrapper">
      <div className="chevron-tracker">
        {exercises.map((ex, index) => {
          const solved = isExerciseSolved(ex.id);
          const active = index === activeExerciseIndex;
          
          let statusClass = 'pending';
          if (active) {
            statusClass = 'active';
          } else if (solved) {
            statusClass = 'completed';
          }

          return (
            <button
              key={ex.id || index}
              className={`chevron-tab ${statusClass}`}
              onClick={() => setActiveExerciseIndex(index)}
              title={ex.title}
            >
              <span className="chevron-number">{index + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ChevronTracker;
