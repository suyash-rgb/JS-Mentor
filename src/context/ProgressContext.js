import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { logProgress, logExercise } from '../utils/analytics';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
    const { getToken } = useAuth();
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

    const markTheoryRead = useCallback(async (rawPageUrl) => {
        const pageUrl = rawPageUrl.replace(/^\//, '');
        setTheoryProgress(prev => ({
            ...prev,
            [pageUrl]: true
        }));
        // Log progress to analytics
        const token = await getToken();
        logProgress(pageUrl, 'COMPLETED', 120, token); // Example fixed time spent
    }, [getToken]);

    const updateLastVisited = useCallback(async (heading, rawPageUrl) => {
        const pageUrl = rawPageUrl.replace(/^\//, '');
        setLastVisited(prev => ({
            ...prev,
            [heading]: pageUrl
        }));
        // Log started progress
        const token = await getToken();
        logProgress(pageUrl, 'IN_PROGRESS', 0, token);
    }, [getToken]);

    const submitExerciseResult = useCallback(async (exerciseId, status, score, submittedCode = '', warnings = 0) => {
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
        // Log exercise to analytics
        const token = await getToken();
        logExercise(exerciseId, submittedCode, status === 'completed', 0, token);
    }, [getToken]);

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
