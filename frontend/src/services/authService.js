import api from './api';

/**
 * Service for authentication related API calls
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User data including name, email, password
   * @returns {Promise<Object>} User data with token
   */
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data with token
   */
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  /**
   * Logout the current user
   * @returns {Promise<Object>} Success message
   */
  logout: async () => {
    return await api.get('/auth/logout');
  },

  /**
   * Get the current logged in user
   * @returns {Promise<Object>} User data
   */
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  updateProfile: async (userData) => {
    return await api.put('/auth/updatedetails', userData);
  },

  /**
   * Update user password
   * @param {Object} passwordData - Password data including currentPassword and newPassword
   * @returns {Promise<Object>} Success message
   */
  updatePassword: async (passwordData) => {
    return await api.put('/auth/updatepassword', passwordData);
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Success message
   */
  forgotPassword: async (email) => {
    return await api.post('/auth/forgotpassword', { email });
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise<Object>} Success message
   */
  resetPassword: async (token, password) => {
    return await api.put(`/auth/resetpassword/${token}`, { password });
  }
};

export default authService; 