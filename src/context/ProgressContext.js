import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';

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

    // State to store last visited page per heading { headingName: pageUrl }
    const [lastVisited, setLastVisited] = useState(() => {
        const saved = localStorage.getItem('js-mentor-last-visited');
        return saved ? JSON.parse(saved) : {};
    });

    // Persist to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('js-mentor-theory-progress', JSON.stringify(theoryProgress));
    }, [theoryProgress]);

    useEffect(() => {
        localStorage.setItem('js-mentor-exercise-progress', JSON.stringify(exerciseProgress));
    }, [exerciseProgress]);

    useEffect(() => {
        localStorage.setItem('js-mentor-last-visited', JSON.stringify(lastVisited));
    }, [lastVisited]);

    const markTheoryRead = useCallback((rawPageUrl) => {
        const pageUrl = rawPageUrl.replace(/^\//, '');
        setTheoryProgress(prev => ({
            ...prev,
            [pageUrl]: true
        }));
    }, []);

    const updateLastVisited = useCallback((heading, rawPageUrl) => {
        const pageUrl = rawPageUrl.replace(/^\//, '');
        setLastVisited(prev => ({
            ...prev,
            [heading]: pageUrl
        }));
    }, []);

    const submitExerciseResult = useCallback((exerciseId, status, score, submittedCode = '', warnings = 0) => {
        setExerciseProgress(prev => ({
            ...prev,
            [exerciseId]: {
                status,
                score,
                submittedCode,
                warnings,
                timestamp: new Date().toISOString()
            }
        }));
    }, []);

    const value = useMemo(() => ({
        theoryProgress,
        exerciseProgress,
        lastVisited,
        markTheoryRead,
        submitExerciseResult,
        updateLastVisited
    }), [theoryProgress, exerciseProgress, lastVisited, markTheoryRead, submitExerciseResult, updateLastVisited]);

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
