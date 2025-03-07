import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        // Return only the data part of the response
        return response.data.data || response.data;
    },
    (error) => {
        // Handle authentication errors
        if (error.response && error.response.status === 401) {
            // Clear token if it's invalid
            localStorage.removeItem('token');

            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Return standardized error for consistent handling
        return Promise.reject({
            status: error.response?.status,
            message: error.response?.data?.message || 'An error occurred',
            errors: error.response?.data?.errors,
            response: error.response
        });
    }
);

export default api; 