const dbHandler = require('./testDbSetup');
const express = require('express');
const app = express();
const supertest = require('supertest');

// Connect to a new in-memory database before running any tests
beforeAll(async () => {
    await dbHandler.connect();

    // Set up mock environment variables
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_EXPIRE = '1h';
    process.env.JWT_COOKIE_EXPIRE = '1';
    process.env.NODE_ENV = 'test';

    // Set up Express middleware and routes for testing
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Import routes
    const authRoutes = require('../../src/routes/auth.routes');
    const userRoutes = require('../../src/routes/users.routes');
    const projectRoutes = require('../../src/routes/projects.routes');
    const taskRoutes = require('../../src/routes/tasks.routes');

    // Mount routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/tasks', taskRoutes);

    // Error handling
    const { errorHandler, notFoundHandler } = require('../../src/middleware/errorMiddleware');
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Make app and request available globally
    global.app = app;
    global.request = supertest(app);
});

// Clear all test data after each test
afterEach(async () => {
    jest.clearAllMocks();
    await dbHandler.clearDatabase();
});

// Remove and close the db and server
afterAll(async () => {
    await dbHandler.closeDatabase();
});

// Mock logger
jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    stream: {
        write: jest.fn()
    }
})); 