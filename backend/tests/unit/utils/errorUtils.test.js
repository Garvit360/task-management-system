const {
    AppError,
    notFound,
    unauthorized,
    forbidden,
    validation,
    duplicate,
    server
} = require('../../../src/utils/errorUtils');

describe('Error Utilities Tests', () => {
    describe('AppError Class', () => {
        it('should create an error with correct properties', () => {
            const message = 'Test error message';
            const statusCode = 400;

            const error = new AppError(message, statusCode);

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(AppError);
            expect(error.message).toBe(message);
            expect(error.statusCode).toBe(statusCode);
            expect(error.isOperational).toBe(true);
            expect(error.stack).toBeDefined();
        });
    });

    describe('Error Factory Functions', () => {
        it('should create a not found error', () => {
            const resource = 'User';
            const error = notFound(resource);

            expect(error).toBeInstanceOf(AppError);
            expect(error.message).toBe('User not found');
            expect(error.statusCode).toBe(404);
        });

        it('should create an unauthorized error', () => {
            const message = 'Custom unauthorized message';
            const error = unauthorized(message);

            expect(error).toBeInstanceOf(AppError);
            expect(error.message).toBe(message);
            expect(error.statusCode).toBe(401);
        });

        it('should create a forbidden error', () => {
            const error = forbidden();

            expect(error).toBeInstanceOf(AppError);
            expect(error.message).toBe('Forbidden access');
            expect(error.statusCode).toBe(403);
        });

        it('should create a validation error', () => {
            const message = 'Custom validation message';
            const error = validation(message);

            expect(error).toBeInstanceOf(AppError);
            expect(error.message).toBe(message);
            expect(error.statusCode).toBe(400);
        });

        it('should create a duplicate resource error', () => {
            const resource = 'Email';
            const error = duplicate(resource);

            expect(error).toBeInstanceOf(AppError);
            expect(error.message).toBe('Email already exists');
            expect(error.statusCode).toBe(409);
        });

        it('should create a server error', () => {
            const message = 'Database connection error';
            const error = server(message);

            expect(error).toBeInstanceOf(AppError);
            expect(error.message).toBe(message);
            expect(error.statusCode).toBe(500);
        });

        it('should use default messages when not provided', () => {
            expect(notFound().message).toBe('Resource not found');
            expect(unauthorized().message).toBe('Not authorized to access this resource');
            expect(forbidden().message).toBe('Forbidden access');
            expect(validation().message).toBe('Validation error');
            expect(duplicate().message).toBe('Resource already exists');
            expect(server().message).toBe('Internal server error');
        });
    });
}); 