const jwt = require('jsonwebtoken');
const User = require('../../../src/models/User');
const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    forgotPassword,
    resetPassword
} = require('../../../src/controllers/authController');

// Mock dependencies and modules
jest.mock('jsonwebtoken');
jest.mock('../../../src/utils/responseHandler', () => ({
    success: jest.fn((res, code, message, data) => {
        res.statusCode = code;
        res.message = message;
        res.data = data;
        return res;
    }),
    error: jest.fn()
}));

describe('Auth Controller Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            user: { _id: 'user-id' },
            cookies: {},
            protocol: 'http',
            get: jest.fn(() => 'localhost')
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            cookie: jest.fn()
        };

        next = jest.fn();

        // Clear all mocks between tests
        jest.clearAllMocks();
    });

    describe('Register User', () => {
        it('should register a new user and return token', async () => {
            // Mock User.findOne and User.create
            User.findOne = jest.fn().mockResolvedValue(null);

            const savedUser = {
                _id: 'new-user-id',
                name: 'Test User',
                email: 'test@example.com',
                role: 'Member',
                updateLastLogin: jest.fn().mockResolvedValue(true),
                password: undefined
            };

            User.create = jest.fn().mockResolvedValue(savedUser);

            // Mock JWT token generation
            const token = 'test-token';
            jwt.sign = jest.fn().mockReturnValue(token);

            // Set up request body
            req.body = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'Member'
            };

            // Call the controller function
            await registerUser(req, res, next);

            // Verify the function behavior
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(User.create).toHaveBeenCalledWith(req.body);
            expect(savedUser.updateLastLogin).toHaveBeenCalled();
            expect(jwt.sign).toHaveBeenCalled();
            expect(res.cookie).toHaveBeenCalledWith('token', token, expect.any(Object));

            // Verify the response
            expect(res.statusCode).toBe(201);
            expect(res.message).toBe('User registered successfully');
            expect(res.data).toEqual({
                user: {
                    _id: 'new-user-id',
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'Member',
                    token
                }
            });
        });

        it('should call next with error if user already exists', async () => {
            // Mock existing user
            User.findOne = jest.fn().mockResolvedValue({ email: 'test@example.com' });

            // Set up request body
            req.body = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };

            // Call the controller function
            await registerUser(req, res, next);

            // Verify error handling
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toContain('User with this email');
        });
    });

    describe('Login User', () => {
        it('should login user and return token if credentials are valid', async () => {
            // Create a mock user
            const user = {
                _id: 'user-id',
                name: 'Test User',
                email: 'test@example.com',
                role: 'Member',
                isActive: true,
                matchPassword: jest.fn().mockResolvedValue(true),
                updateLastLogin: jest.fn().mockResolvedValue(true),
                password: undefined
            };

            // Mock User.findOne
            User.findOne = jest.fn().mockReturnThis();
            User.findOne.select = jest.fn().mockResolvedValue(user);

            // Mock JWT token generation
            const token = 'test-token';
            jwt.sign = jest.fn().mockReturnValue(token);

            // Set up request body
            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            // Call the controller function
            await loginUser(req, res, next);

            // Verify the function behavior
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(User.findOne.select).toHaveBeenCalledWith('+password');
            expect(user.matchPassword).toHaveBeenCalledWith('password123');
            expect(user.updateLastLogin).toHaveBeenCalled();
            expect(jwt.sign).toHaveBeenCalled();
            expect(res.cookie).toHaveBeenCalledWith('token', token, expect.any(Object));

            // Verify the response
            expect(res.statusCode).toBe(200);
            expect(res.message).toBe('Login successful');
            expect(res.data).toEqual({
                user: {
                    _id: 'user-id',
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'Member',
                    token
                }
            });
        });

        it('should call next with error if credentials are invalid', async () => {
            // Mock user with invalid password
            const user = {
                matchPassword: jest.fn().mockResolvedValue(false)
            };

            User.findOne = jest.fn().mockReturnThis();
            User.findOne.select = jest.fn().mockResolvedValue(user);

            // Set up request body
            req.body = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            // Call the controller function
            await loginUser(req, res, next);

            // Verify error handling
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toBe('Invalid credentials');
        });

        it('should call next with error if user is not active', async () => {
            // Mock inactive user
            const user = {
                matchPassword: jest.fn().mockResolvedValue(true),
                isActive: false
            };

            User.findOne = jest.fn().mockReturnThis();
            User.findOne.select = jest.fn().mockResolvedValue(user);

            // Set up request body
            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            // Call the controller function
            await loginUser(req, res, next);

            // Verify error handling
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toContain('deactivated');
        });
    });

    describe('Logout User', () => {
        it('should clear the token cookie', async () => {
            // Call the controller function
            await logoutUser(req, res);

            // Verify cookie clearing
            expect(res.cookie).toHaveBeenCalledWith('token', 'none', {
                expires: expect.any(Date),
                httpOnly: true
            });

            // Verify response
            expect(res.statusCode).toBe(200);
            expect(res.message).toBe('User logged out successfully');
        });
    });

    describe('Get Me', () => {
        it('should return current user profile', async () => {
            // Mock user
            const user = {
                _id: 'user-id',
                name: 'Test User',
                email: 'test@example.com',
                role: 'Member',
                avatar: 'default.jpg',
                projects: [],
                isActive: true,
                lastLogin: new Date(),
                createdAt: new Date()
            };

            User.findById = jest.fn().mockResolvedValue(user);

            // Set up request with authenticated user
            req.user = { _id: 'user-id' };

            // Call the controller function
            await getMe(req, res);

            // Verify the function behavior
            expect(User.findById).toHaveBeenCalledWith('user-id');

            // Verify the response
            expect(res.statusCode).toBe(200);
            expect(res.message).toBe('User profile retrieved successfully');
            expect(res.data).toEqual({ user });
        });
    });

    describe('Forgot Password', () => {
        it('should generate reset token and return success', async () => {
            // Mock user
            const user = {
                email: 'test@example.com',
                generatePasswordResetToken: jest.fn().mockReturnValue('reset-token'),
                save: jest.fn().mockResolvedValue(true)
            };

            User.findOne = jest.fn().mockResolvedValue(user);

            // Set up request body
            req.body = { email: 'test@example.com' };

            // Call the controller function
            await forgotPassword(req, res, next);

            // Verify the function behavior
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(user.generatePasswordResetToken).toHaveBeenCalled();
            expect(user.save).toHaveBeenCalledWith({ validateBeforeSave: false });

            // Verify the response
            expect(res.statusCode).toBe(200);
            expect(res.message).toBe('Password reset email sent if account exists');
        });

        it('should still return success if user is not found (security)', async () => {
            // Mock user not found
            User.findOne = jest.fn().mockResolvedValue(null);

            // Set up request body
            req.body = { email: 'nonexistent@example.com' };

            // Call the controller function
            await forgotPassword(req, res, next);

            // Verify the response (still shows success for security)
            expect(res.statusCode).toBe(200);
            expect(res.message).toBe('Password reset email sent if account exists');
        });
    });
}); 