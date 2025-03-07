const express = require('express');
const {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// Project routes
router
    .route('/')
    .get(getProjects)
    .post(createProject);

router
    .route('/:id')
    .get(getProject)
    .put(updateProject)
    .delete(deleteProject);

// Member management routes
router
    .route('/:id/members')
    .post(addProjectMember);

router
    .route('/:id/members/:userId')
    .delete(removeProjectMember);

module.exports = router; 