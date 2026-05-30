import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const BASE_URL = `${API_BASE_URL}/api/v1/student`;


/**
 * Returns student Clerk token headers.
 * Clerk exposes the active session token via window.Clerk.session.getToken().
 */
const getStudentHeaders = async (manualToken = null) => {
    if (manualToken) return { headers: { Authorization: `Bearer ${manualToken}` } };

    try {
        if (window.Clerk?.session) {
            const token = await window.Clerk.session.getToken();
            if (token) return { headers: { Authorization: `Bearer ${token}` } };
        }
    } catch (err) {
        console.warn('studentService: Could not get Clerk token', err);
    }
    return {};
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
        const headers = await getStudentHeaders(token);
        await axios.post(`${BASE_URL}/progress`, {
            topic_id: topicId,
            status: status,
            time_spent_seconds: timeSpentSeconds
        }, headers);
    } catch (error) {
        console.error("StudentService: Failed to log progress", error);
        // Clear from cache on error to allow immediate retry if needed
        throttleCache.delete(throttleKey);
    }
};

export const logExercise = async (exerciseId, codeSubmitted, isCorrect, executionTimeMs = 0, token = null) => {
    try {
        const headers = await getStudentHeaders(token);
        await axios.post(`${BASE_URL}/exercise`, {
            exercise_id: exerciseId,
            code_submitted: codeSubmitted,
            is_correct: isCorrect,
            execution_time_ms: executionTimeMs
        }, headers);
    } catch (error) {
        console.error("StudentService: Failed to log exercise", error);
    }
};

export const logQuiz = async (quizId, score, totalQuestions, token = null) => {
    try {
        const headers = await getStudentHeaders(token);
        await axios.post(`${BASE_URL}/quiz`, {
            quiz_id: quizId,
            score: score,
            total_questions: totalQuestions
        }, headers);
    } catch (error) {
        console.error("StudentService: Failed to log quiz", error);
    }
};

/**
 * GET /api/v1/student/doubts/mine
 * Returns the student's own doubt sessions (all statuses).
 */
export const getMyDoubts = async () => {
    const headers = await getStudentHeaders();
    const response = await axios.get(`${BASE_URL}/doubts/mine`, headers);
    return response.data; // array of session objects
};

export const logVideo = async (topicId, videoUrl, isCompleted, watchedSeconds = 0, token = null) => {
    try {
        const headers = await getStudentHeaders(token);
        await axios.post(`${BASE_URL}/video`, {
            topic_id: topicId,
            video_url: videoUrl,
            is_completed: isCompleted,
            watched_seconds: watchedSeconds
        }, headers);
    } catch (error) {
        console.error("StudentService: Failed to log video", error);
    }
};

export const getTopicStatus = async (topicId, token = null) => {
    try {
        const headers = await getStudentHeaders(token);
        const response = await axios.get(`${BASE_URL}/topic-status/${encodeURIComponent(topicId)}`, headers);
        return response.data;
    } catch (error) {
        console.error("StudentService: Failed to get topic status", error);
        return { videos: {}, quizzes: {}, exercises: {} };
    }
};
