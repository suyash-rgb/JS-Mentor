import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const getTrainerAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const getDashboardOverview = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/trainer/me/dashboard-overview`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch dashboard overview", error);
        throw error;
    }
};

export const getSubmissions = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/trainer/grading/submissions`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch submissions", error);
        throw error;
    }
};

export const gradeSubmission = async (submissionId, score, feedback) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/trainer/grading/submissions/${submissionId}/grade`, { score, feedback }, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to grade submission", error);
        throw error;
    }
};

export const getLearningPathNames = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/curriculum/learning-path-names`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch learning path names", error);
        throw error;
    }
};

export const getAllQuizzes = async (pathHeading = null) => {
    try {
        const url = pathHeading
            ? `${API_BASE_URL}/curriculum/quizzes?path_heading=${encodeURIComponent(pathHeading)}`
            : `${API_BASE_URL}/curriculum/quizzes`;
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
            ? `${API_BASE_URL}/curriculum/exercises?path_heading=${encodeURIComponent(pathHeading)}`
            : `${API_BASE_URL}/curriculum/exercises`;
        const response = await axios.get(url, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch exercises", error);
        throw error;
    }
};

export const getTopicsForLearningPath = async (learningPath) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/curriculum/learning-path/${encodeURIComponent(learningPath)}/topics`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch topics for learning path", error);
        throw error;
    }
};

export const getAllVideos = async (pathHeading = null) => {
    try {
        const url = pathHeading
            ? `${API_BASE_URL}/curriculum/videos?path_heading=${encodeURIComponent(pathHeading)}`
            : `${API_BASE_URL}/curriculum/videos`;
        const response = await axios.get(url, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch videos", error);
        throw error;
    }
};

export const addVideo = async (pathHeading, pageText, videoData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/curriculum/add-video`, videoData, {
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
        const response = await axios.put(`${API_BASE_URL}/curriculum/videos/${videoId}`, updateData, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to update video", error);
        throw error;
    }
};

export const deleteVideo = async (videoId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/curriculum/videos/${videoId}`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to delete video", error);
        throw error;
    }
};

export const getVideosForLearningPath = async (learningPath) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/curriculum/learning-path/${encodeURIComponent(learningPath)}/videos`, getTrainerAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Trainer Service: Failed to fetch videos for learning path", error);
        throw error;
    }
};
