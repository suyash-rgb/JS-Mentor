import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('token');
    if (!token && window.Clerk?.session) {
      try {
        token = await window.Clerk.session.getToken();
      } catch (err) {
        console.warn('api interceptor: Could not get Clerk token', err);
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
