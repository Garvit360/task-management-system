import api from './api';

/**
 * Service for user related API calls
 */
const userService = {
    /**
     * Get all users (admin only)
     * @returns {Promise<Array>} List of users
     */
    getUsers: async () => {
        return await api.get('/users');
    },

    /**
     * Get a specific user by ID (admin only)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User data
     */
    getUser: async (userId) => {
        return await api.get(`/users/${userId}`);
    },

    /**
     * Update a user (admin only)
     * @param {string} userId - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise<Object>} Updated user
     */
    updateUser: async (userId, userData) => {
        return await api.put(`/users/${userId}`, userData);
    },

    /**
     * Delete a user (admin only)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Success message
     */
    deleteUser: async (userId) => {
        return await api.delete(`/users/${userId}`);
    }
};

export default userService; 