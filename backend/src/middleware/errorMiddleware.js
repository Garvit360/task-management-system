const logger = require('../utils/logger');
const { AppError } = require('../utils/errorUtils');

/**
 * Middleware to handle 404 errors for routes that don't exist
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
};

/**
 * Custom error handler middleware
 * @param {Object} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log errors based on environment
    if (process.env.NODE_ENV === 'development') {
        logger.error(`${err.name}: ${err.message}\n${err.stack}`);
    } else {
        logger.error(`${err.name}: ${err.message}`);
    }

    // MongoDB bad ObjectId errors
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = new AppError(message, 404);
    }

    // MongoDB duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        const message = `Duplicate field value: ${field} with value "${value}" already exists`;
        error = new AppError(message, 409);
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);
        const message = `Invalid input data: ${errors.join(', ')}`;
        error = new AppError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new AppError('Invalid token. Please log in again.', 401);
    }

    // JWT expired error
    if (err.name === 'TokenExpiredError') {
        error = new AppError('Your token has expired. Please log in again.', 401);
    }

    // Send response with appropriate error
    res.status(error.statusCode || err.statusCode || 500).json({
        success: false,
        message: error.message || err.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        ...(err.errors && { errors: err.errors })
    });
};

module.exports = { notFoundHandler, errorHandler }; 