/**
 * Standard success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {Object} meta - Additional metadata (pagination, etc.)
 */
exports.success = (res, statusCode = 200, message = 'Success', data = null, meta = {}) => {
    const response = {
        success: true,
        message,
        ...(data !== null && { data }),
        ...meta
    };
    return res.status(statusCode).json(response);
};

/**
 * Standard error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} errors - Detailed errors
 */
exports.error = (res, statusCode = 500, message = 'Server Error', errors = null) => {
    const response = {
        success: false,
        message,
        ...(errors !== null && { errors })
    };
    return res.status(statusCode).json(response);
};

/**
 * Pagination helper
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
exports.getPaginationInfo = (page, limit, total) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const pagination = {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit)
    };

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

    return pagination;
}; 