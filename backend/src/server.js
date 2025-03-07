const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Import utilities
const logger = require('./utils/logger');
const connectDB = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const { swaggerUi, swaggerDocs } = require('./utils/swaggerDocs');

// Connect to database
connectDB();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Initialize express app
const app = express();

// Security middleware
app.use(helmet()); // Set security HTTP headers

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'status',
        'priority',
        'sort',
        'limit',
        'page',
        'fields',
        'createdBy',
        'assignee',
        'reporter',
        'project'
    ]
}));

// CORS middleware
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));

// Logger middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev', { stream: logger.stream }));
} else {
    app.use(morgan('combined', {
        stream: fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' })
    }));
}

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }'
}));

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const projectRoutes = require('./routes/projects.routes');
const taskRoutes = require('./routes/tasks.routes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Create uploads directory for file attachments
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Base route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running...',
        version: '1.0.0',
        documentation: '/api-docs'
    });
});

// Handle 404 errors
app.use(notFoundHandler);

// Custom error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Error: ${err.message}`);
    logger.error('Unhandled Rejection! 💥 Shutting down...');
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Error: ${err.message}`);
    logger.error('Uncaught Exception! 💥 Shutting down...');
    // Close server & exit process
    process.exit(1);
}); 