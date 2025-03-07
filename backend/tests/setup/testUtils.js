const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const Project = require('../../src/models/Project');
const Task = require('../../src/models/Task');

/**
 * Create a test user with specified role
 * @param {string} role - User role (Admin, Manager, Member)
 * @returns {Object} User object with auth token
 */
const createTestUser = async (role = 'Member') => {
    const userData = {
        name: `Test ${role}`,
        email: `test${role.toLowerCase()}${Date.now()}@example.com`,
        password: 'password123',
        role
    };

    const user = await User.create(userData);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });

    return { user, token };
};

/**
 * Create a test project with specified owner and members
 * @param {mongoose.Types.ObjectId} ownerId - Project owner ID
 * @param {Array} memberIds - Array of member IDs
 * @returns {Object} Project object
 */
const createTestProject = async (ownerId, memberIds = []) => {
    const projectData = {
        name: `Test Project ${Date.now()}`,
        description: 'This is a test project created for testing purposes',
        createdBy: ownerId,
        members: memberIds
    };

    return await Project.create(projectData);
};

/**
 * Create a test task with specified details
 * @param {mongoose.Types.ObjectId} projectId - Project ID
 * @param {mongoose.Types.ObjectId} assigneeId - Assignee user ID
 * @param {mongoose.Types.ObjectId} reporterId - Reporter user ID
 * @param {string} status - Task status
 * @returns {Object} Task object
 */
const createTestTask = async (projectId, assigneeId, reporterId, status = 'To-Do') => {
    const taskData = {
        title: `Test Task ${Date.now()}`,
        description: 'This is a test task created for testing purposes',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status,
        priority: 'Medium',
        project: projectId,
        assignee: assigneeId,
        reporter: reporterId
    };

    return await Task.create(taskData);
};

/**
 * Create auth header with token
 * @param {string} token - JWT token
 * @returns {Object} Headers object with authorization
 */
const authHeader = (token) => ({
    Authorization: `Bearer ${token}`
});

module.exports = {
    createTestUser,
    createTestProject,
    createTestTask,
    authHeader
}; 