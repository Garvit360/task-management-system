const express = require('express');
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// Admin-only routes
router
    .route('/')
    .get(authorize('Admin'), getUsers);

router
    .route('/:id')
    .get(authorize('Admin'), getUserById)
    .put(authorize('Admin'), updateUser)
    .delete(authorize('Admin'), deleteUser);

module.exports = router; 