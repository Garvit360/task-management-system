import api from './api';

/**
 * Service for task related API calls
 */
const taskService = {
    /**
     * Get all tasks with optional filters
     * @param {Object} filters - Optional filters for tasks
     * @returns {Promise<Array>} List of tasks
     */
    getTasks: async (filters = {}) => {
        const queryParams = new URLSearchParams();

        // Add filters to query params
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value);
            }
        });

        const queryString = queryParams.toString();
        const url = queryString ? `/tasks?${queryString}` : '/tasks';

        return await api.get(url);
    },

    /**
     * Get tasks by project
     * @param {string} projectId - Project ID
     * @returns {Promise<Array>} List of tasks
     */
    getTasksByProject: async (projectId) => {
        return await api.get(`/tasks/project/${projectId}`);
    },

    /**
     * Get tasks by user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} List of tasks
     */
    getTasksByUser: async (userId) => {
        return await api.get(`/tasks/user/${userId}`);
    },

    /**
     * Get a specific task by ID
     * @param {string} taskId - Task ID
     * @returns {Promise<Object>} Task data
     */
    getTask: async (taskId) => {
        return await api.get(`/tasks/${taskId}`);
    },

    /**
     * Create a new task
     * @param {Object} taskData - Task data
     * @returns {Promise<Object>} Created task
     */
    createTask: async (taskData) => {
        return await api.post('/tasks', taskData);
    },

    /**
     * Update a task
     * @param {string} taskId - Task ID
     * @param {Object} taskData - Updated task data
     * @returns {Promise<Object>} Updated task
     */
    updateTask: async (taskId, taskData) => {
        return await api.put(`/tasks/${taskId}`, taskData);
    },

    /**
     * Delete a task
     * @param {string} taskId - Task ID
     * @returns {Promise<Object>} Success message
     */
    deleteTask: async (taskId) => {
        return await api.delete(`/tasks/${taskId}`);
    },

    /**
     * Add a comment to a task
     * @param {string} taskId - Task ID
     * @param {Object} comment - Comment data
     * @returns {Promise<Object>} Updated task
     */
    addComment: async (taskId, comment) => {
        return await api.post(`/tasks/${taskId}/comments`, { text: comment });
    },

    /**
     * Upload an attachment to a task
     * @param {string} taskId - Task ID
     * @param {File} file - File to upload
     * @returns {Promise<Object>} Updated task
     */
    uploadAttachment: async (taskId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        // Special config to handle form data
        return await api.post(`/tasks/${taskId}/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    /**
     * Delete an attachment from a task
     * @param {string} taskId - Task ID
     * @param {string} attachmentId - Attachment ID
     * @returns {Promise<Object>} Updated task
     */
    deleteAttachment: async (taskId, attachmentId) => {
        return await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
    }
};

export default taskService; 