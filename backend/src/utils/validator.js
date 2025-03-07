const Joi = require('joi');
const { validation } = require('./errorUtils');

/**
 * Validate request body against a schema
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
exports.validateBody = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, '')
            }));

            return next(validation('Validation failed', errors));
        }

        next();
    };
};

/**
 * Validate request query against a schema
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
exports.validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, '')
            }));

            return next(validation('Query validation failed', errors));
        }

        next();
    };
};

/**
 * Validate request params against a schema
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
exports.validateParams = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.params, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, '')
            }));

            return next(validation('Parameter validation failed', errors));
        }

        next();
    };
};

// Common schemas
exports.schemas = {
    // ID validation schema
    id: Joi.object({
        id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
            .messages({
                'string.pattern.base': 'ID must be a valid MongoDB ObjectId',
                'any.required': 'ID is required'
            })
    }),

    // Pagination schema
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sort: Joi.string(),
        fields: Joi.string()
    }),

    // User schemas
    user: {
        create: Joi.object({
            name: Joi.string().min(3).max(50).required()
                .messages({
                    'string.min': 'Name must be at least 3 characters',
                    'string.max': 'Name must be at most 50 characters',
                    'any.required': 'Name is required'
                }),
            email: Joi.string().email().required()
                .messages({
                    'string.email': 'Please enter a valid email address',
                    'any.required': 'Email is required'
                }),
            password: Joi.string().min(6).required()
                .messages({
                    'string.min': 'Password must be at least 6 characters',
                    'any.required': 'Password is required'
                }),
            role: Joi.string().valid('Admin', 'Manager', 'Member').default('Member')
        }),
        update: Joi.object({
            name: Joi.string().min(3).max(50),
            email: Joi.string().email(),
            password: Joi.string().min(6),
            role: Joi.string().valid('Admin', 'Manager', 'Member')
        }).min(1)
    },

    // Auth schemas
    auth: {
        login: Joi.object({
            email: Joi.string().email().required()
                .messages({
                    'string.email': 'Please enter a valid email address',
                    'any.required': 'Email is required'
                }),
            password: Joi.string().required()
                .messages({
                    'any.required': 'Password is required'
                })
        })
    },

    // Project schemas
    project: {
        create: Joi.object({
            name: Joi.string().min(3).max(100).required()
                .messages({
                    'string.min': 'Name must be at least 3 characters',
                    'string.max': 'Name must be at most 100 characters',
                    'any.required': 'Name is required'
                }),
            description: Joi.string().min(5).required()
                .messages({
                    'string.min': 'Description must be at least 5 characters',
                    'any.required': 'Description is required'
                }),
            members: Joi.array().items(
                Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                    .message('Member ID must be a valid MongoDB ObjectId')
            )
        }),
        update: Joi.object({
            name: Joi.string().min(3).max(100),
            description: Joi.string().min(5),
            members: Joi.array().items(
                Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                    .message('Member ID must be a valid MongoDB ObjectId')
            )
        }).min(1)
    },

    // Task schemas
    task: {
        create: Joi.object({
            title: Joi.string().min(3).max(100).required()
                .messages({
                    'string.min': 'Title must be at least 3 characters',
                    'string.max': 'Title must be at most 100 characters',
                    'any.required': 'Title is required'
                }),
            description: Joi.string().min(5).required()
                .messages({
                    'string.min': 'Description must be at least 5 characters',
                    'any.required': 'Description is required'
                }),
            dueDate: Joi.date().greater('now').required()
                .messages({
                    'date.greater': 'Due date must be in the future',
                    'any.required': 'Due date is required'
                }),
            status: Joi.string().valid('To-Do', 'In Progress', 'Completed').default('To-Do'),
            priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
            assignee: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
                .messages({
                    'string.pattern.base': 'Assignee ID must be a valid MongoDB ObjectId',
                    'any.required': 'Assignee is required'
                }),
            project: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
                .messages({
                    'string.pattern.base': 'Project ID must be a valid MongoDB ObjectId',
                    'any.required': 'Project is required'
                })
        }),
        update: Joi.object({
            title: Joi.string().min(3).max(100),
            description: Joi.string().min(5),
            dueDate: Joi.date().greater('now'),
            status: Joi.string().valid('To-Do', 'In Progress', 'Completed'),
            priority: Joi.string().valid('Low', 'Medium', 'High'),
            assignee: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                .messages({
                    'string.pattern.base': 'Assignee ID must be a valid MongoDB ObjectId'
                })
        }).min(1),
        comment: Joi.object({
            text: Joi.string().min(1).required()
                .messages({
                    'string.min': 'Comment text cannot be empty',
                    'any.required': 'Comment text is required'
                })
        })
    }
}; 