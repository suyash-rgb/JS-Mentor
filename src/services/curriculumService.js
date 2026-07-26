import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchNotes = async (pathId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/curriculum/notes/${encodeURIComponent(pathId)}`);
        return response.data;
    } catch (error) {
        console.error(`CurriculumService: Failed to fetch notes for ${pathId}`, error);
        throw error;
    }
};

export const updateNotes = async (pathId, content) => {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.put(
            `${API_BASE_URL}/api/v1/curriculum/notes/${encodeURIComponent(pathId)}`,
            { content },
            headers
        );
        return response.data;
    } catch (error) {
        console.error(`CurriculumService: Failed to update notes for ${pathId}`, error);
        throw error;
    }
};
export const updateStudentNote = async (pathId, content) => {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.put(
            `${API_BASE_URL}/api/v1/curriculum/student/notes/${encodeURIComponent(pathId)}`,
            { content },
            headers
        );
        return response.data;
    } catch (error) {
        console.error(`CurriculumService: Failed to update student note for ${pathId}`, error);
        throw error;
    }
};

export const fetchClassSummary = async (summaryId) => {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/curriculum/notes/summary/${summaryId}`,
            headers
        );
        return response.data;
    } catch (error) {
        console.error(`CurriculumService: Failed to fetch class summary ${summaryId}`, error);
        throw error;
    }
};

export const importSummaryToNote = async (pathId, summaryId) => {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.post(
            `${API_BASE_URL}/api/v1/curriculum/notes/${encodeURIComponent(pathId)}/import-summary/${summaryId}`,
            {},
            headers
        );
        return response.data;
    } catch (error) {
        console.error(`CurriculumService: Failed to import summary ${summaryId} for ${pathId}`, error);
        throw error;
    }
};
