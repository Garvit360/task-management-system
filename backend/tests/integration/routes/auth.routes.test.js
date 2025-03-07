const mongoose = require('mongoose');
const User = require('../../../src/models/User');

describe('Auth Routes Tests', () => {
    describe('POST /api/auth/register', () => {
        const validUserData = {
            name: 'Integration Test User',
            email: 'integrationtest@example.com',
            password: 'password123'
        };

        it('should register a new user', async () => {
            const response = await request
                .post('/api/auth/register')
                .send(validUserData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User registered successfully');
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.token).toBeDefined();
            expect(response.body.data.user.email).toBe(validUserData.email);

            // Verify user was created in the database
            const createdUser = await User.findOne({ email: validUserData.email });
            expect(createdUser).toBeTruthy();
            expect(createdUser.name).toBe(validUserData.name);
        });

        it('should fail to register a user with missing data', async () => {
            const response = await request
                .post('/api/auth/register')
                .send({ name: 'Incomplete User' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should fail to register a duplicate user', async () => {
            // First, create a user
            await request
                .post('/api/auth/register')
                .send({
                    name: 'Duplicate User',
                    email: 'duplicate@example.com',
                    password: 'password123'
                });

            // Then try to create the same user again
            const response = await request
                .post('/api/auth/register')
                .send({
                    name: 'Duplicate User 2',
                    email: 'duplicate@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        // Create a user before tests
        beforeEach(async () => {
            await User.create({
                name: 'Login Test User',
                email: 'login@example.com',
                password: 'password123'
            });
        });

        it('should login with valid credentials', async () => {
            const response = await request
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.token).toBeDefined();
            expect(response.body.data.user.email).toBe('login@example.com');
        });

        it('should fail to login with invalid credentials', async () => {
            const response = await request
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid credentials');
        });

        it('should fail to login with non-existent user', async () => {
            const response = await request
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid credentials');
        });
    });

    describe('GET /api/auth/me', () => {
        let token;

        // Create a user and get token before tests
        beforeEach(async () => {
            const userData = {
                name: 'Profile User',
                email: 'profile@example.com',
                password: 'password123'
            };

            const user = await User.create(userData);

            const loginResponse = await request
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            token = loginResponse.body.data.user.token;
        });

        it('should get user profile when authenticated', async () => {
            const response = await request
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('User profile');
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.email).toBe('profile@example.com');
        });

        it('should fail to get profile without authentication', async () => {
            const response = await request
                .get('/api/auth/me');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Not authorized');
        });

        it('should fail with invalid token', async () => {
            const response = await request
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Not authorized');
        });
    });

    describe('GET /api/auth/logout', () => {
        let token;

        // Create a user and get token before tests
        beforeEach(async () => {
            const userData = {
                name: 'Logout User',
                email: 'logout@example.com',
                password: 'password123'
            };

            const user = await User.create(userData);

            const loginResponse = await request
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            token = loginResponse.body.data.user.token;
        });

        it('should logout user and clear cookie', async () => {
            const response = await request
                .get('/api/auth/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('logged out');

            // Check for cookie (in a real browser test, would check for expired cookie)
            expect(response.headers['set-cookie']).toBeDefined();
            expect(response.headers['set-cookie'][0]).toContain('token=none');
        });
    });
});