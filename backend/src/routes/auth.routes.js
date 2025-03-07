const express = require('express');
const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody, schemas } = require('../utils/validator');

const router = express.Router();

// Public routes
router.post('/register', validateBody(schemas.user.create), registerUser);
router.post('/login', validateBody(schemas.auth.login), loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.get('/logout', logoutUser);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);

module.exports = router; 