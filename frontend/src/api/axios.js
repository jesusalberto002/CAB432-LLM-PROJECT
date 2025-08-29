import axios from 'axios';

const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:8000/api/v1', // Use environment variable or default
  withCredentials: true, // Include cookies in requests
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;