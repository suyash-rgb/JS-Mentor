import React, { createContext, useState, useEffect, useContext } from 'react';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
    // State to store theory reading status { pageUrl: boolean }
    const [theoryProgress, setTheoryProgress] = useState(() => {
        const saved = localStorage.getItem('js-mentor-theory-progress');
        return saved ? JSON.parse(saved) : {};
    });

    // State to store exercise attempts { exerciseId: { status, score, timestamp } }
    const [exerciseProgress, setExerciseProgress] = useState(() => {
        const saved = localStorage.getItem('js-mentor-exercise-progress');
        return saved ? JSON.parse(saved) : {};
    });

    // Persist to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('js-mentor-theory-progress', JSON.stringify(theoryProgress));
    }, [theoryProgress]);

    useEffect(() => {
        localStorage.setItem('js-mentor-exercise-progress', JSON.stringify(exerciseProgress));
    }, [exerciseProgress]);

    const markTheoryRead = (pageUrl) => {
        setTheoryProgress(prev => ({
            ...prev,
            [pageUrl]: true
        }));
    };

    const submitExerciseResult = (exerciseId, status, score) => {
        setExerciseProgress(prev => ({
            ...prev,
            [exerciseId]: {
                status,
                score,
                timestamp: new Date().toISOString()
            }
        }));
    };

    const value = {
        theoryProgress,
        exerciseProgress,
        markTheoryRead,
        submitExerciseResult
    };

    return (
        <ProgressContext.Provider value={value}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgressContext = () => {
    const context = useContext(ProgressContext);
    if (!context) {
        throw new Error('useProgressContext must be used within a ProgressProvider');
    }
    return context;
};
