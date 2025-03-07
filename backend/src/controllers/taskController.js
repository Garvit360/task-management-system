const Task = require('../models/Task');
const Project = require('../models/Project');
const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Create unique filename
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: process.env.MAX_FILE_SIZE || 1000000 // Default 1MB
    },
    fileFilter: function (req, file, cb) {
        // Allowed extensions
        const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
        // Check extension
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        // Check mime type
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Error: File type not supported!'));
        }
    }
}).single('file');

/**
 * @desc    Create new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
    // Set reporter to current user
    req.body.reporter = req.user._id;

    // Check if project exists
    const project = await Project.findById(req.body.project);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if user is authorized to create task in this project
    const isAuthorized =
        req.user.role === 'Admin' ||
        project.createdBy.equals(req.user._id) ||
        project.members.some(member => member.toString() === req.user._id.toString());

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to create tasks in this project');
    }

    // Create task
    const task = await Task.create(req.body);

    res.status(201).json({
        success: true,
        data: task
    });
});

/**
 * @desc    Get all tasks
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Task.find(JSON.parse(queryStr));

    // If user is not admin, only get tasks from projects they're part of
    if (req.user.role !== 'Admin') {
        const userProjects = await Project.find({
            $or: [
                { createdBy: req.user._id },
                { members: req.user._id }
            ]
        }).select('_id');

        const projectIds = userProjects.map(project => project._id);

        query = query.where('project').in(projectIds);
    }

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Task.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const tasks = await query
        .populate('assignee', 'name email')
        .populate('reporter', 'name email')
        .populate('project', 'name');

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: tasks.length,
        pagination,
        data: tasks
    });
});

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
        .populate('assignee', 'name email')
        .populate('reporter', 'name email')
        .populate('project', 'name')
        .populate('comments.createdBy', 'name email')
        .populate('attachments.uploadedBy', 'name email');

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Get the project to check authorization
    const project = await Project.findById(task.project);

    // Check if user is authorized to access this task
    const isAuthorized =
        req.user.role === 'Admin' ||
        project.createdBy.equals(req.user._id) ||
        project.members.some(member => member.toString() === req.user._id.toString());

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to access this task');
    }

    res.status(200).json({
        success: true,
        data: task
    });
});

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
    let task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Get the project to check authorization
    const project = await Project.findById(task.project);

    // Check if user is authorized to update this task
    const isAuthorized =
        req.user.role === 'Admin' ||
        project.createdBy.equals(req.user._id) ||
        task.assignee.equals(req.user._id) ||
        task.reporter.equals(req.user._id);

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to update this task');
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: task
    });
});

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Get the project to check authorization
    const project = await Project.findById(task.project);

    // Check if user is authorized to delete this task
    const isAuthorized =
        req.user.role === 'Admin' ||
        project.createdBy.equals(req.user._id) ||
        task.reporter.equals(req.user._id);

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to delete this task');
    }

    await task.remove();

    res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
    });
});

/**
 * @desc    Add comment to task
 * @route   POST /api/tasks/:id/comments
 * @access  Private
 */
const addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text) {
        res.status(400);
        throw new Error('Please provide comment text');
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Get the project to check authorization
    const project = await Project.findById(task.project);

    // Check if user is authorized to comment on this task
    const isAuthorized =
        req.user.role === 'Admin' ||
        project.createdBy.equals(req.user._id) ||
        project.members.some(member => member.toString() === req.user._id.toString());

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to comment on this task');
    }

    // Add comment
    const comment = {
        text,
        createdBy: req.user._id
    };

    task.comments.push(comment);
    await task.save();

    const updatedTask = await Task.findById(req.params.id)
        .populate('comments.createdBy', 'name email');

    res.status(200).json({
        success: true,
        data: updatedTask
    });
});

/**
 * @desc    Upload file attachment to task
 * @route   POST /api/tasks/:id/attachments
 * @access  Private
 */
const uploadAttachment = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Get the project to check authorization
    const project = await Project.findById(task.project);

    // Check if user is authorized to add attachments to this task
    const isAuthorized =
        req.user.role === 'Admin' ||
        project.createdBy.equals(req.user._id) ||
        project.members.some(member => member.toString() === req.user._id.toString());

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to add attachments to this task');
    }

    // Handle file upload
    upload(req, res, async (err) => {
        if (err) {
            res.status(400);
            throw new Error(err.message);
        }

        if (!req.file) {
            res.status(400);
            throw new Error('Please upload a file');
        }

        // Add attachment to task
        const attachment = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user._id
        };

        task.attachments.push(attachment);
        await task.save();

        const updatedTask = await Task.findById(req.params.id)
            .populate('attachments.uploadedBy', 'name email');

        res.status(200).json({
            success: true,
            data: updatedTask
        });
    });
});

/**
 * @desc    Delete attachment from task
 * @route   DELETE /api/tasks/:id/attachments/:attachmentId
 * @access  Private
 */
const deleteAttachment = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Get the project to check authorization
    const project = await Project.findById(task.project);

    // Check if user is authorized to delete attachments from this task
    const isAuthorized =
        req.user.role === 'Admin' ||
        project.createdBy.equals(req.user._id) ||
        task.reporter.equals(req.user._id);

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to delete attachments from this task');
    }

    // Find attachment
    const attachment = task.attachments.id(req.params.attachmentId);

    if (!attachment) {
        res.status(404);
        throw new Error('Attachment not found');
    }

    // Delete file from filesystem
    const filePath = path.join(process.env.FILE_UPLOAD_PATH || './uploads/', attachment.filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    // Remove attachment from task
    task.attachments = task.attachments.filter(
        attach => attach._id.toString() !== req.params.attachmentId
    );

    await task.save();

    res.status(200).json({
        success: true,
        data: task
    });
});

/**
 * @desc    Get tasks by user
 * @route   GET /api/tasks/user/:userId
 * @access  Private
 */
const getTasksByUser = asyncHandler(async (req, res) => {
    // Admin can see anyone's tasks, others can only see their own
    if (req.user.role !== 'Admin' && req.params.userId !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view these tasks');
    }

    const tasks = await Task.find({ assignee: req.params.userId })
        .populate('project', 'name')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
    });
});

/**
 * @desc    Get tasks by project
 * @route   GET /api/tasks/project/:projectId
 * @access  Private
 */
const getTasksByProject = asyncHandler(async (req, res) => {
    // Check if project exists
    const project = await Project.findById(req.params.projectId);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if user is authorized to view this project's tasks
    const isAuthorized =
        req.user.role === 'Admin' ||
        project.createdBy.equals(req.user._id) ||
        project.members.some(member => member.toString() === req.user._id.toString());

    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to view tasks for this project');
    }

    const tasks = await Task.find({ project: req.params.projectId })
        .populate('assignee', 'name email')
        .populate('reporter', 'name email')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
    });
});

module.exports = {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    addComment,
    uploadAttachment,
    deleteAttachment,
    getTasksByUser,
    getTasksByProject
}; 