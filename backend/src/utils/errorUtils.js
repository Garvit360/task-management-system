/**
 * Custom error class with status code
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Create a not found error
 * @param {string} resource - Name of the resource not found
 * @returns {AppError} Not found error
 */
const notFound = (resource = 'Resource') => {
    return new AppError(`${resource} not found`, 404);
};

/**
 * Create an unauthorized error
 * @param {string} message - Custom message
 * @returns {AppError} Unauthorized error
 */
const unauthorized = (message = 'Not authorized to access this resource') => {
    return new AppError(message, 401);
};

/**
 * Create a forbidden error
 * @param {string} message - Custom message
 * @returns {AppError} Forbidden error
 */
const forbidden = (message = 'Forbidden access') => {
    return new AppError(message, 403);
};

/**
 * Create a validation error
 * @param {string} message - Custom message
 * @returns {AppError} Validation error
 */
const validation = (message = 'Validation error') => {
    return new AppError(message, 400);
};

/**
 * Create a duplicate resource error
 * @param {string} resource - Name of the duplicate resource
 * @returns {AppError} Duplicate resource error
 */
const duplicate = (resource = 'Resource') => {
    return new AppError(`${resource} already exists`, 409);
};

/**
 * Create a server error
 * @param {string} message - Custom message
 * @returns {AppError} Server error
 */
const server = (message = 'Internal server error') => {
    return new AppError(message, 500);
};

module.exports = {
    AppError,
    notFound,
    unauthorized,
    forbidden,
    validation,
    duplicate,
    server
}; 