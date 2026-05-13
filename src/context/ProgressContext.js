import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
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

    // Keep a ref mirrored to state for use in callbacks without triggering dependency loops
    const theoryProgressRef = useRef(theoryProgress);
    useEffect(() => {
        theoryProgressRef.current = theoryProgress;
    }, [theoryProgress]);

    // Ref to track what we've already sent to the server in this session
    const loggedProgress = useRef(new Set());

    const markTheoryRead = useCallback(async (rawPageUrl) => {
        const pageUrl = rawPageUrl.replace(/^\//, '');
        
        // Use ref for the check to avoid dependency on theoryProgress state
        if (theoryProgressRef.current[pageUrl]) return;

        setTheoryProgress(prev => ({
            ...prev,
            [pageUrl]: true
        }));

        const cacheKey = `${pageUrl}_COMPLETED`;
        if (loggedProgress.current.has(cacheKey)) return;
        
        loggedProgress.current.add(cacheKey);

        try {
            const token = await getToken();
            await logProgress(pageUrl, 'COMPLETED', 120, token);
        } catch (error) {
            console.error("Failed to log progress", error);
            loggedProgress.current.delete(cacheKey); // Allow retry on failure
        }
    }, [getToken]);

    const updateLastVisited = useCallback(async (heading, rawPageUrl) => {
        const pageUrl = rawPageUrl.replace(/^\//, '');
        
        setLastVisited(prev => {
            if (prev[heading] === pageUrl) return prev;
            return { ...prev, [heading]: pageUrl };
        });

        // Use ref for the check to avoid dependency on theoryProgress state
        if (theoryProgressRef.current[pageUrl]) return;
        
        const cacheKey = `${pageUrl}_IN_PROGRESS`;
        if (loggedProgress.current.has(cacheKey) || loggedProgress.current.has(`${pageUrl}_COMPLETED`)) return;

        loggedProgress.current.add(cacheKey);

        try {
            const token = await getToken();
            await logProgress(pageUrl, 'IN_PROGRESS', 0, token);
        } catch (error) {
            console.error("Failed to log visit", error);
            loggedProgress.current.delete(cacheKey);
        }
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
        try {
            const token = await getToken();
            await logExercise(exerciseId, submittedCode, status === 'completed', 0, token);
        } catch (error) {
            console.error("Failed to log exercise result", error);
        }
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
