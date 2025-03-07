const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../../src/models/User');

describe('User Model Tests', () => {
    describe('User Schema', () => {
        it('should create & save user successfully', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'Member'
            };

            const validUser = new User(userData);
            const savedUser = await validUser.save();

            // Object Id should be defined
            expect(savedUser._id).toBeDefined();
            expect(savedUser.name).toBe(userData.name);
            expect(savedUser.email).toBe(userData.email);
            expect(savedUser.role).toBe(userData.role);

            // Password should be hashed
            expect(savedUser.password).not.toBe(userData.password);
        });

        it('should fail validation without required fields', async () => {
            const invalidUser = new User({});

            let error;
            try {
                await invalidUser.validate();
            } catch (err) {
                error = err;
            }

            expect(error).toBeDefined();
            expect(error.errors.name).toBeDefined();
            expect(error.errors.email).toBeDefined();
            expect(error.errors.password).toBeDefined();
        });

        it('should fail for invalid email format', async () => {
            const userWithInvalidEmail = new User({
                name: 'Test User',
                email: 'invalid-email',
                password: 'password123',
                role: 'Member'
            });

            let error;
            try {
                await userWithInvalidEmail.validate();
            } catch (err) {
                error = err;
            }

            expect(error).toBeDefined();
            expect(error.errors.email).toBeDefined();
        });

        it('should enforce enum values for role', async () => {
            const userWithInvalidRole = new User({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'InvalidRole'
            });

            let error;
            try {
                await userWithInvalidRole.validate();
            } catch (err) {
                error = err;
            }

            expect(error).toBeDefined();
            expect(error.errors.role).toBeDefined();
        });
    });

    describe('User Methods', () => {
        it('should match passwords correctly when using matchPassword method', async () => {
            const password = 'testpassword';
            const user = new User({
                name: 'Test User',
                email: 'test@example.com',
                password,
                role: 'Member'
            });

            await user.save();

            // Test correct password
            const isMatch = await user.matchPassword(password);
            expect(isMatch).toBe(true);

            // Test incorrect password
            const isWrongMatch = await user.matchPassword('wrongpassword');
            expect(isWrongMatch).toBe(false);
        });

        it('should generate a reset token when using generatePasswordResetToken', async () => {
            const user = new User({
                name: 'Reset Test User',
                email: 'reset@example.com',
                password: 'password123',
                role: 'Member'
            });

            await user.save();

            const resetToken = user.generatePasswordResetToken();

            expect(resetToken).toBeDefined();
            expect(typeof resetToken).toBe('string');
            expect(user.resetPasswordToken).toBeDefined();
            expect(user.resetPasswordExpire).toBeDefined();

            // Token expiration should be set in the future
            expect(user.resetPasswordExpire.getTime()).toBeGreaterThan(Date.now());
        });

        it('should update lastLogin when using updateLastLogin method', async () => {
            const user = new User({
                name: 'Login Test User',
                email: 'login@example.com',
                password: 'password123',
                role: 'Member'
            });

            await user.save();

            // Initially lastLogin should be undefined
            expect(user.lastLogin).toBeUndefined();

            await user.updateLastLogin();

            // After calling updateLastLogin, lastLogin should be defined
            expect(user.lastLogin).toBeDefined();
            expect(user.lastLogin instanceof Date).toBe(true);
        });
    });

    describe('User Static Methods', () => {
        it('should return user statistics by role using getUserStats', async () => {
            // Create a series of users with different roles
            await User.create([
                {
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: 'password123',
                    role: 'Admin'
                },
                {
                    name: 'Manager User',
                    email: 'manager@example.com',
                    password: 'password123',
                    role: 'Manager'
                },
                {
                    name: 'Member User 1',
                    email: 'member1@example.com',
                    password: 'password123',
                    role: 'Member'
                },
                {
                    name: 'Member User 2',
                    email: 'member2@example.com',
                    password: 'password123',
                    role: 'Member'
                }
            ]);

            const stats = await User.getUserStats();

            expect(Array.isArray(stats)).toBe(true);

            // Find stats for each role
            const adminStats = stats.find(stat => stat._id === 'Admin');
            const managerStats = stats.find(stat => stat._id === 'Manager');
            const memberStats = stats.find(stat => stat._id === 'Member');

            expect(adminStats).toBeDefined();
            expect(adminStats.count).toBe(1);

            expect(managerStats).toBeDefined();
            expect(managerStats.count).toBe(1);

            expect(memberStats).toBeDefined();
            expect(memberStats.count).toBe(2);
        });
    });
}); 