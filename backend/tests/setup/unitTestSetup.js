const dbHandler = require('./testDbSetup');

// Connect to a new in-memory database before running any tests
beforeAll(async () => {
    await dbHandler.connect();
});

// Clear all test data after each test
afterEach(async () => {
    await dbHandler.clearDatabase();
});

// Remove and close the db and server
afterAll(async () => {
    await dbHandler.closeDatabase();
});

// Global mock for logger to prevent console logs during tests
jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    stream: {
        write: jest.fn()
    }
}));

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRE = '1h';
process.env.JWT_COOKIE_EXPIRE = '1'; 