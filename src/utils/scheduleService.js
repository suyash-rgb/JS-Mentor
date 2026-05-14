import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1/schedule';

// ─── Auth helpers ────────────────────────────────────────────────────────────

/**
 * Returns trainer JWT headers from localStorage.
 */
const getTrainerHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Returns student Clerk token headers.
 * Clerk exposes the active session token via window.Clerk.session.getToken().
 */
const getStudentHeaders = async () => {
    try {
        if (window.Clerk?.session) {
            const token = await window.Clerk.session.getToken();
            if (token) return { Authorization: `Bearer ${token}` };
        }
    } catch (err) {
        console.warn('scheduleService: Could not get Clerk token', err);
    }
    return {};
};

// ─── Student APIs ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/schedule/doubts/register
 * Registers a student doubt and returns the backend success message.
 * @param {string} topic       - minimum 5 characters
 * @param {string} description - minimum 20 characters
 * @param {number} learningPathIndex - 1-indexed (1-6)
 */
export const registerDoubt = async (topic, description, learningPathIndex) => {
    const headers = await getStudentHeaders();
    const response = await axios.post(
        `${API_BASE_URL}/doubts/register`,
        { topic, description, learning_path_index: learningPathIndex },
        { headers }
    );
    return response.data; // { doubt_id, topic, duration_minutes, status, message }
};

/**
 * GET /api/v1/schedule/doubts/mine
 * Returns the student's own doubt sessions (all statuses).
 */
export const getMyDoubts = async () => {
    const headers = await getStudentHeaders();
    const response = await axios.get(`${API_BASE_URL}/doubts/mine`, { headers });
    return response.data; // array of session objects
};

// ─── Trainer APIs ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/schedule/queue
 * Returns the FIFO-ordered pending doubt queue for today (trainer only).
 */
export const getDoubtQueue = async () => {
    const response = await axios.get(`${API_BASE_URL}/queue`, {
        headers: getTrainerHeaders(),
    });
    return response.data; // array of { doubt_id, student_name, topic, description, expected_duration_minutes }
};

/**
 * GET /api/v1/schedule/trainer/my-sessions
 * Returns the trainer's scheduled sessions, optionally filtered by date.
 * @param {string|null} targetDate - "YYYY-MM-DD" or null for all upcoming
 */
export const getTrainerSessions = async (targetDate = null) => {
    const params = targetDate ? { target_date: targetDate } : {};
    const response = await axios.get(`${API_BASE_URL}/trainer/my-sessions`, {
        headers: getTrainerHeaders(),
        params,
    });
    return response.data; // array of session objects
};

/**
 * Fetches the dynamic slug-to-index mapping from the curriculum service.
 */
export const getSlugMapping = async () => {
    // Note: This endpoint is on the curriculum router
    const response = await axios.get('http://localhost:8000/api/v1/curriculum/slug-mapping');
    return response.data;
};
