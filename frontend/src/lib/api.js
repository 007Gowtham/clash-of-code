import axios from 'axios';
import { toast } from 'react-hot-toast';

const getBaseUrl = () => {
    let envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!envUrl) return 'http://localhost:3004/api';

    // Remove trailing slash if present
    if (envUrl.endsWith('/')) {
        envUrl = envUrl.slice(0, -1);
    }

    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const API_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error || error.response?.data?.message || 'Something went wrong';

        // Check for 401 Unauthorized (invalid token)
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Only redirect if not already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }

        // Don't show toast for 404s or specific handled errors if needed
        if (error.response?.status !== 404) {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export const auth = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (data) => api.post('/auth/register', data),
    verifyEmail: (data) => api.post('/auth/verify-email', data),
    getMe: () => api.get('/auth/me'),
};

export const rooms = {
    getAll: (params) => api.get('/rooms', { params }), // { search, status, type }
    getOne: (id) => api.get(`/rooms/${id}`),
    create: (data) => api.post('/rooms', data),
    join: (data) => api.post('/rooms/join', data),
    leave: (id) => api.post(`/rooms/${id}/leave`),
};

export const teams = {
    getByRoom: (roomId) => api.get(`/teams/room/${roomId}`),
    create: (data) => api.post('/teams', data),
    join: (data) => api.post('/teams/join', data),
    leave: (id) => api.post(`/teams/${id}/leave`),
    getMembers: (id) => api.get(`/teams/${id}/members`),
};

export const questions = {
    list: (params) => api.get('/questions', { params }),
    getOne: (id) => api.get(`/questions/${id}`),
};

export const submissions = {
    submit: (data) => api.post('/submissions', data),
    getByRoom: (roomId) => api.get(`/submissions/room/${roomId}`),
};

export default api;
