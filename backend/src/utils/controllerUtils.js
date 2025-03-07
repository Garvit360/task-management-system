const { notFound } = require('./errorUtils');
const { getPaginationInfo } = require('./responseHandler');
const logger = require('./logger');

/**
 * Standard handler for getting a single document by ID
 * @param {Model} Model - Mongoose model
 * @param {Object} options - Options for the query
 * @returns {Function} Express route handler
 */
exports.getOne = (Model, options = {}) => async (req, res, next) => {
    try {
        const { id } = req.params;
        const { populate = [], select = '' } = options;

        let query = Model.findById(id);

        // Apply population
        if (populate.length > 0) {
            populate.forEach(field => {
                query = query.populate(field);
            });
        }

        // Apply field selection
        if (select) {
            query = query.select(select);
        }

        // Execute query
        const doc = await query;

        // Check if document exists
        if (!doc) {
            return next(notFound(`${Model.modelName}`));
        }

        // Return document
        return res.status(200).json({
            success: true,
            data: doc
        });
    } catch (err) {
        logger.error(`Error in getOne: ${err.message}`);
        next(err);
    }
};

/**
 * Standard handler for getting all documents with pagination
 * @param {Model} Model - Mongoose model
 * @param {Object} options - Options for the query
 * @returns {Function} Express route handler
 */
exports.getAll = (Model, options = {}) => async (req, res, next) => {
    try {
        const {
            populate = [],
            select = '',
            filterField = null,
            filterValue = null
        } = options;

        // Parse pagination parameters
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Create query
        let query = Model.find();

        // Apply filtering if provided
        if (filterField && filterValue) {
            query = query.where(filterField).equals(filterValue);
        }

        // Apply population
        if (populate.length > 0) {
            populate.forEach(field => {
                query = query.populate(field);
            });
        }

        // Apply field selection
        if (select) {
            query = query.select(select);
        }

        // Apply sorting
        const sortBy = req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt';
        query = query.sort(sortBy);

        // Apply pagination
        query = query.skip(skip).limit(limit);

        // Execute query
        const [results, total] = await Promise.all([
            query,
            Model.countDocuments(filterField && filterValue ? { [filterField]: filterValue } : {})
        ]);

        // Get pagination info
        const pagination = getPaginationInfo(page, limit, total);

        // Return results
        return res.status(200).json({
            success: true,
            count: results.length,
            pagination,
            data: results
        });
    } catch (err) {
        logger.error(`Error in getAll: ${err.message}`);
        next(err);
    }
};

/**
 * Standard handler for creating a new document
 * @param {Model} Model - Mongoose model
 * @param {Object} options - Options for the operation
 * @returns {Function} Express route handler
 */
exports.createOne = (Model, options = {}) => async (req, res, next) => {
    try {
        const { populate = [], transformData = null } = options;

        // Transform data if function provided
        const data = transformData ? transformData(req) : req.body;

        // Create document
        let doc = await Model.create(data);

        // Apply population if needed
        if (populate.length > 0) {
            const populateQuery = populate.map(p => typeof p === 'string' ? { path: p } : p);
            doc = await Model.findById(doc._id).populate(populateQuery);
        }

        // Return created document
        return res.status(201).json({
            success: true,
            data: doc
        });
    } catch (err) {
        logger.error(`Error in createOne: ${err.message}`);
        next(err);
    }
};

/**
 * Standard handler for updating a document
 * @param {Model} Model - Mongoose model
 * @param {Object} options - Options for the operation
 * @returns {Function} Express route handler
 */
exports.updateOne = (Model, options = {}) => async (req, res, next) => {
    try {
        const { id } = req.params;
        const { populate = [], transformData = null } = options;

        // Find document first
        const doc = await Model.findById(id);

        // Check if document exists
        if (!doc) {
            return next(notFound(`${Model.modelName}`));
        }

        // Transform data if function provided
        const data = transformData ? transformData(req, doc) : req.body;

        // Update document
        const updatedDoc = await Model.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });

        // Apply population if needed
        if (populate.length > 0) {
            const populateQuery = populate.map(p => typeof p === 'string' ? { path: p } : p);
            await updatedDoc.populate(populateQuery);
        }

        // Return updated document
        return res.status(200).json({
            success: true,
            data: updatedDoc
        });
    } catch (err) {
        logger.error(`Error in updateOne: ${err.message}`);
        next(err);
    }
};

/**
 * Standard handler for deleting a document
 * @param {Model} Model - Mongoose model
 * @param {Object} options - Options for the operation
 * @returns {Function} Express route handler
 */
exports.deleteOne = (Model, options = {}) => async (req, res, next) => {
    try {
        const { id } = req.params;
        const { onDelete = null } = options;

        // Find document first
        const doc = await Model.findById(id);

        // Check if document exists
        if (!doc) {
            return next(notFound(`${Model.modelName}`));
        }

        // Call onDelete hook if provided
        if (onDelete) {
            await onDelete(doc, req);
        }

        // Delete document
        await doc.remove();

        // Return success message
        return res.status(200).json({
            success: true,
            message: `${Model.modelName} deleted successfully`
        });
    } catch (err) {
        logger.error(`Error in deleteOne: ${err.message}`);
        next(err);
    }
}; 