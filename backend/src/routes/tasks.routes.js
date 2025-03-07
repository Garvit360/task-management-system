const express = require('express');
const {
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
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// Task routes
router
    .route('/')
    .get(getTasks)
    .post(createTask);

router
    .route('/:id')
    .get(getTask)
    .put(updateTask)
    .delete(deleteTask);

// Comment routes
router
    .route('/:id/comments')
    .post(addComment);

// Attachment routes
router
    .route('/:id/attachments')
    .post(uploadAttachment);

router
    .route('/:id/attachments/:attachmentId')
    .delete(deleteAttachment);

// Tasks by user/project
router
    .route('/user/:userId')
    .get(getTasksByUser);

router
    .route('/project/:projectId')
    .get(getTasksByProject);

module.exports = router;