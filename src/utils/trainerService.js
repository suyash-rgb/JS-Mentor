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
