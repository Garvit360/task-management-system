import api from './api';

/**
 * Service for project related API calls
 */
const projectService = {
    /**
     * Get all projects
     * @returns {Promise<Array>} List of projects
     */
    getProjects: async () => {
        return await api.get('/projects');
    },

    /**
     * Get a specific project by ID
     * @param {string} projectId - Project ID
     * @returns {Promise<Object>} Project data
     */
    getProject: async (projectId) => {
        return await api.get(`/projects/${projectId}`);
    },

    /**
     * Create a new project
     * @param {Object} projectData - Project data
     * @returns {Promise<Object>} Created project
     */
    createProject: async (projectData) => {
        return await api.post('/projects', projectData);
    },

    /**
     * Update a project
     * @param {string} projectId - Project ID
     * @param {Object} projectData - Updated project data
     * @returns {Promise<Object>} Updated project
     */
    updateProject: async (projectId, projectData) => {
        return await api.put(`/projects/${projectId}`, projectData);
    },

    /**
     * Delete a project
     * @param {string} projectId - Project ID
     * @returns {Promise<Object>} Success message
     */
    deleteProject: async (projectId) => {
        return await api.delete(`/projects/${projectId}`);
    },

    /**
     * Add a member to a project
     * @param {string} projectId - Project ID
     * @param {string} userId - User ID to add
     * @returns {Promise<Object>} Updated project
     */
    addProjectMember: async (projectId, userId) => {
        return await api.post(`/projects/${projectId}/members`, { userId });
    },

    /**
     * Remove a member from a project
     * @param {string} projectId - Project ID
     * @param {string} userId - User ID to remove
     * @returns {Promise<Object>} Updated project
     */
    removeProjectMember: async (projectId, userId) => {
        return await api.delete(`/projects/${projectId}/members/${userId}`);
    }
};

export default projectService; 