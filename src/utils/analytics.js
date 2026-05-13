import axios from 'axios';

const BASE_URL = 'http://localhost:8000/analytics';

const getAuthHeaders = async (manualToken = null) => {
    const token = manualToken || localStorage.getItem('token');
    console.log("Analytics Debug: Using token:", token ? `${token.substring(0, 10)}...` : "NULL");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Throttling cache: { 'topicId_status': lastTimestamp }
const throttleCache = new Map();
const THROTTLE_MS = 2000; // 2 seconds

export const logProgress = async (topicId, status, timeSpentSeconds = 0, token = null) => {
    // 1. Client-side Throttling/Deduplication
    const throttleKey = `${topicId}_${status}`;
    const now = Date.now();
    const lastCall = throttleCache.get(throttleKey);

    if (lastCall && (now - lastCall < THROTTLE_MS)) {
        // Skip redundant request if sent too recently
        return;
    }
    
    throttleCache.set(throttleKey, now);

    try {
        const headers = await getAuthHeaders(token);
        await axios.post(`${BASE_URL}/progress`, {
            topic_id: topicId,
            status: status,
            time_spent_seconds: timeSpentSeconds
        }, headers);
    } catch (error) {
        console.error("Analytics: Failed to log progress", error);
        // Clear from cache on error to allow immediate retry if needed
        throttleCache.delete(throttleKey);
    }
};

export const logExercise = async (exerciseId, codeSubmitted, isCorrect, executionTimeMs = 0, token = null) => {
    try {
        const headers = await getAuthHeaders(token);
        await axios.post(`${BASE_URL}/exercise`, {
            exercise_id: exerciseId,
            code_submitted: codeSubmitted,
            is_correct: isCorrect,
            execution_time_ms: executionTimeMs
        }, headers);
    } catch (error) {
        console.error("Analytics: Failed to log exercise", error);
    }
};

export const logQuiz = async (quizId, score, totalQuestions, token = null) => {
    try {
        const headers = await getAuthHeaders(token);
        await axios.post(`${BASE_URL}/quiz`, {
            quiz_id: quizId,
            score: score,
            total_questions: totalQuestions
        }, headers);
    } catch (error) {
        console.error("Analytics: Failed to log quiz", error);
    }
};
