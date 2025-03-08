import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000 // 15 seconds timeout
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
        // Return standardized response data
        return response.data.data || response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
            console.error('Network Error:', error.message);
            return Promise.reject({
                status: 'network_error',
                message: 'Unable to connect to the server. Please check your internet connection.',
            });
        }

        // Handle authentication errors
        if (error.response.status === 401) {
            // If token is invalid or expired and this wasn't already a retry
            if (!originalRequest._retry) {
                // Clear token from storage
                localStorage.removeItem('token');

                // Redirect to login if not already there
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
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

// Helper function for retrying requests
api.retryRequest = async (fn, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            // Only retry on network errors or 5xx server errors
            if (!error.response || (error.response.status >= 500 && error.response.status < 600)) {
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            break;
        }
    }

    throw lastError;
};

export default api; 