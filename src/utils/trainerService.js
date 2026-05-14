import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const getTrainerAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const getDashboardOverview = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/trainer/me/dashboard-overview`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch dashboard overview", error);
        throw error;
    }
};

export const getSubmissions = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/trainer/grading/submissions`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch submissions", error);
        throw error;
    }
};

export const gradeSubmission = async (submissionId, score, feedback) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/v1/trainer/grading/submissions/${submissionId}/grade`, { score, feedback }, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to grade submission", error);
        throw error;
    }
};

export const getLearningPathNames = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/curriculum/learning-path-names`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch learning path names", error);
        throw error;
    }
};

export const getFullCurriculum = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/curriculum/`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch full curriculum", error);
        throw error;
    }
};

export const getAllQuizzes = async (pathHeading = null) => {
    try {
        const url = pathHeading
            ? `${API_BASE_URL}/api/v1/curriculum/quizzes?path_heading=${encodeURIComponent(pathHeading)}`
            : `${API_BASE_URL}/api/v1/curriculum/quizzes`;
        const response = await axios.get(url, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch quizzes", error);
        throw error;
    }
};

export const getAllExercises = async (pathHeading = null) => {
    try {
        const url = pathHeading
            ? `${API_BASE_URL}/api/v1/curriculum/exercises?path_heading=${encodeURIComponent(pathHeading)}`
            : `${API_BASE_URL}/api/v1/curriculum/exercises`;
        const response = await axios.get(url, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch exercises", error);
        throw error;
    }
};

export const getTopicsForLearningPath = async (learningPath) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/curriculum/learning-path/${encodeURIComponent(learningPath)}/topics`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch topics for learning path", error);
        throw error;
    }
};

export const getAllVideos = async (pathHeading = null) => {
    try {
        const url = pathHeading
            ? `${API_BASE_URL}/api/v1/curriculum/videos?path_heading=${encodeURIComponent(pathHeading)}`
            : `${API_BASE_URL}/api/v1/curriculum/videos`;
        const response = await axios.get(url, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch videos", error);
        throw error;
    }
};

export const addVideo = async (pathHeading, pageText, videoData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/curriculum/add-video`, videoData, {
            ...getTrainerAuthHeaders(),
            params: { path_heading: pathHeading, page_text: pageText }
        });
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to add video", error);
        throw error;
    }
};

export const updateVideo = async (videoId, updateData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/v1/curriculum/videos/${videoId}`, updateData, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to update video", error);
        throw error;
    }
};

export const deleteVideo = async (videoId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/v1/curriculum/videos/${videoId}`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to delete video", error);
        throw error;
    }
};

export const getVideosForLearningPath = async (learningPath) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/curriculum/learning-path/${encodeURIComponent(learningPath)}/videos`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch videos for learning path", error);
        throw error;
    }
};

export const addQuiz = async (pathHeading, pageText, quizData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/curriculum/add-quiz`, quizData, {
            ...getTrainerAuthHeaders(),
            params: { path_heading: pathHeading, page_text: pageText }
        });
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to add quiz", error);
        throw error;
    }
};

export const addQuizCsv = async (pathHeading, pageText, formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/curriculum/add-quiz-csv`, formData, {
            ...getTrainerAuthHeaders(),
            params: { path_heading: pathHeading, page_text: pageText }
        });
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to add CSV quiz", error);
        throw error;
    }
};

export const updateQuiz = async (quizId, updateData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/v1/curriculum/quizzes/${quizId}`, updateData, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to update quiz", error);
        throw error;
    }
};

export const deleteQuiz = async (quizId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/v1/curriculum/quizzes/${quizId}`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to delete quiz", error);
        throw error;
    }
};

export const addExercise = async (pathHeading, pageText, exerciseData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/curriculum/add-exercise`, exerciseData, {
            ...getTrainerAuthHeaders(),
            params: { path_heading: pathHeading, page_text: pageText }
        });
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to add exercise", error);
        throw error;
    }
};

export const updateExercise = async (exerciseId, updateData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/v1/curriculum/exercises/${exerciseId}`, updateData, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to update exercise", error);
        throw error;
    }
};

export const deleteExercise = async (exerciseId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/v1/curriculum/learning-paths/delete-exercises/${exerciseId}`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to delete exercise", error);
        throw error;
    }
};

export const createLearningPath = async (pathData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/curriculum/learning-paths`, pathData, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to create learning path", error);
        throw error;
    }
};

export const updateLearningPath = async (heading, pathUpdate) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/v1/curriculum/learning-paths/${encodeURIComponent(heading)}`, pathUpdate, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to update learning path", error);
        throw error;
    }
};
export const getCohortStats = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/trainer/cohort-stats`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch cohort stats", error);
        throw error;
    }
};

export const getHighRiskStudents = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/ml/high_risk_students`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch high risk students", error);
        throw error;
    }
};

export const updateAvailability = async (isAvailable) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/v1/trainer/me/availability`, null, {
            ...getTrainerAuthHeaders(),
            params: { is_available: isAvailable }
        });
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to update availability", error);
        throw error;
    }
};
