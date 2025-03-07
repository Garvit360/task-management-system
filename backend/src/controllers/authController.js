const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AppError, unauthorized, validation, duplicate } = require('../utils/errorUtils');
const { success } = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { validateBody } = require('../utils/validator');

/**
 * Generate JWT token
 * @param {String} id - User ID
 * @returns {String} JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(duplicate('User with this email'));
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'Member'
    });

    // Update last login time
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    // Set cookie with the token
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('token', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    // Send response
    return success(res, 201, 'User registered successfully', {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        }
    });
});

/**
 * @desc    Authenticate a user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Check for required fields
    if (!email || !password) {
        return next(validation('Please provide email and password'));
    }

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user || !await user.matchPassword(password)) {
        return next(unauthorized('Invalid credentials'));
    }

    // Check if user is active
    if (!user.isActive) {
        return next(unauthorized('Your account has been deactivated. Please contact an administrator.'));
    }

    // Update last login time
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    // Set cookie with the token
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('token', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    // Send response
    return success(res, 200, 'Login successful', {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        }
    });
});

/**
 * @desc    Log user out / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    return success(res, 200, 'User logged out successfully');
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    return success(res, 200, 'User profile retrieved successfully', {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            projects: user.projects,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
        }
    });
});

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
const updateDetails = asyncHandler(async (req, res, next) => {
    const { name, email } = req.body;

    // Validate input
    if (!name && !email) {
        return next(validation('Please provide at least one field to update'));
    }

    // Prepare fields to update
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;

    // Update user
    const user = await User.findByIdAndUpdate(
        req.user._id,
        fieldsToUpdate,
        {
            new: true,
            runValidators: true
        }
    );

    return success(res, 200, 'User details updated successfully', {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
        return next(validation('Please provide current password and new password'));
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    if (!await user.matchPassword(currentPassword)) {
        return next(unauthorized('Current password is incorrect'));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    // Set cookie with the token
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('token', token, cookieOptions);

    return success(res, 200, 'Password updated successfully', {
        token
    });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    // Validate input
    if (!email) {
        return next(validation('Please provide an email address'));
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
        // Don't reveal that user doesn't exist for security reasons
        return success(res, 200, 'Password reset email sent if account exists');
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    // In a real app, you would send an email here
    // For now, just log the reset URL
    logger.info(`Password reset token generated: ${resetUrl}`);

    // Send response
    return success(res, 200, 'Password reset email sent if account exists');
});

/**
 * @desc    Reset password
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
    // Get token from parameters
    const { resettoken } = req.params;
    const { password } = req.body;

    // Validate input
    if (!password) {
        return next(validation('Please provide a new password'));
    }

    // Hash the token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(resettoken)
        .digest('hex');

    // Find user by token and valid expiration
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(unauthorized('Invalid or expired token'));
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    // Set cookie with the token
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('token', token, cookieOptions);

    return success(res, 200, 'Password reset successful', {
        token
    });
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword
}; 