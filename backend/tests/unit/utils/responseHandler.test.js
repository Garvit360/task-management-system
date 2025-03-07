const { success, error, getPaginationInfo } = require('../../../src/utils/responseHandler');

describe('Response Handler Tests', () => {
    describe('Success Response', () => {
        it('should generate a standard success response', () => {
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const data = { id: 1, name: 'Test' };

            success(res, 200, 'Success message', data);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Success message',
                data
            });
        });

        it('should include meta data in the response', () => {
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const data = { id: 1, name: 'Test' };
            const meta = { count: 10, total: 100 };

            success(res, 200, 'Success message', data, meta);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Success message',
                data,
                count: 10,
                total: 100
            });
        });

        it('should use default status code and message if not provided', () => {
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            success(res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Success'
            });
        });
    });

    describe('Error Response', () => {
        it('should generate a standard error response', () => {
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const errors = { field: 'Email is required' };

            error(res, 400, 'Error message', errors);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Error message',
                errors
            });
        });

        it('should use default status code and message if not provided', () => {
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            error(res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server Error'
            });
        });
    });

    describe('Pagination Info', () => {
        it('should generate correct pagination info', () => {
            const page = 2;
            const limit = 10;
            const total = 25;

            const pagination = getPaginationInfo(page, limit, total);

            expect(pagination).toEqual({
                currentPage: 2,
                itemsPerPage: 10,
                totalItems: 25,
                totalPages: 3,
                next: {
                    page: 3,
                    limit: 10
                },
                prev: {
                    page: 1,
                    limit: 10
                }
            });
        });

        it('should not include next page if on last page', () => {
            const page = 3;
            const limit = 10;
            const total = 25;

            const pagination = getPaginationInfo(page, limit, total);

            expect(pagination).toEqual({
                currentPage: 3,
                itemsPerPage: 10,
                totalItems: 25,
                totalPages: 3,
                prev: {
                    page: 2,
                    limit: 10
                }
            });

            expect(pagination.next).toBeUndefined();
        });

        it('should not include prev page if on first page', () => {
            const page = 1;
            const limit = 10;
            const total = 25;

            const pagination = getPaginationInfo(page, limit, total);

            expect(pagination).toEqual({
                currentPage: 1,
                itemsPerPage: 10,
                totalItems: 25,
                totalPages: 3,
                next: {
                    page: 2,
                    limit: 10
                }
            });

            expect(pagination.prev).toBeUndefined();
        });
    });
}); 