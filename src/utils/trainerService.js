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
