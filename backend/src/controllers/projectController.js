const Project = require('../models/Project');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = asyncHandler(async (req, res) => {
    // Add user to req.body
    req.body.createdBy = req.user._id;

    // Create project
    const project = await Project.create(req.body);

    // Add project to user's projects
    await User.findByIdAndUpdate(req.user._id, {
        $push: { projects: project._id }
    });

    // Add members to project if specified
    if (req.body.members && req.body.members.length > 0) {
        // Remove duplicates
        const uniqueMembers = [...new Set(req.body.members)];

        // Add project to each member's projects
        await User.updateMany(
            { _id: { $in: uniqueMembers } },
            { $push: { projects: project._id } }
        );
    }

    res.status(201).json({
        success: true,
        data: project
    });
});

/**
 * @desc    Get all projects
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = asyncHandler(async (req, res) => {
    let query;

    // If user is admin, get all projects
    if (req.user.role === 'Admin') {
        query = Project.find();
    } else {
        // If user is not admin, only get projects they're part of
        query = Project.find({
            $or: [
                { createdBy: req.user._id },
                { members: req.user._id }
            ]
        });
    }

    // Execute query
    const projects = await query.populate('createdBy', 'name email');

    res.status(200).json({
        success: true,
        count: projects.length,
        data: projects
    });
});

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('members', 'name email');

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if user is authorized to access this project
    const isAuthorized =
        req.user.role === 'Admin' ||
        project.createdBy.equals(req.user._id) ||
        project.members.some(member => member._id.equals(req.user._id));

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to access this project');
    }

    res.status(200).json({
        success: true,
        data: project
    });
});

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = asyncHandler(async (req, res) => {
    let project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if user is authorized to update this project
    const isAuthorized =
        req.user.role === 'Admin' ||
        project.createdBy.equals(req.user._id);

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to update this project');
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: project
    });
});

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if user is authorized to delete this project
    const isAuthorized =
        req.user.role === 'Admin' ||
        project.createdBy.equals(req.user._id);

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to delete this project');
    }

    // Remove project from all users' projects
    await User.updateMany(
        { projects: project._id },
        { $pull: { projects: project._id } }
    );

    await project.remove();

    res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
    });
});

/**
 * @desc    Add member to project
 * @route   POST /api/projects/:id/members
 * @access  Private
 */
const addProjectMember = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        res.status(400);
        throw new Error('Please provide a user ID');
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if user is authorized to modify this project
    const isAuthorized =
        req.user.role === 'Admin' ||
        project.createdBy.equals(req.user._id);

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to modify this project');
    }

    // Check if the user to be added exists
    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if user is already a member
    if (project.members.includes(userId)) {
        res.status(400);
        throw new Error('User is already a member of this project');
    }

    // Add user to project members
    project.members.push(userId);
    await project.save();

    // Add project to user's projects
    await User.findByIdAndUpdate(userId, {
        $push: { projects: project._id }
    });

    res.status(200).json({
        success: true,
        data: project
    });
});

/**
 * @desc    Remove member from project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private
 */
const removeProjectMember = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if user is authorized to modify this project
    const isAuthorized =
        req.user.role === 'Admin' ||
        project.createdBy.equals(req.user._id);

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to modify this project');
    }

    // Remove user from project members
    project.members = project.members.filter(
        member => member.toString() !== req.params.userId
    );

    await project.save();

    // Remove project from user's projects
    await User.findByIdAndUpdate(req.params.userId, {
        $pull: { projects: project._id }
    });

    res.status(200).json({
        success: true,
        data: project
    });
});

module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember
}; 