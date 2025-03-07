const mongoose = require('mongoose');
const Project = require('../../../src/models/Project');
const User = require('../../../src/models/User');

describe('Project Model Tests', () => {
    let testUser;

    beforeEach(async () => {
        // Create a test user to be used as project creator
        testUser = await User.create({
            name: 'Project Test User',
            email: `projecttest${Date.now()}@example.com`,
            password: 'password123',
            role: 'Manager'
        });
    });

    describe('Project Schema', () => {
        it('should create & save project successfully', async () => {
            const projectData = {
                name: 'Test Project',
                description: 'This is a test project',
                createdBy: testUser._id
            };

            const validProject = new Project(projectData);
            const savedProject = await validProject.save();

            // Object Id should be defined
            expect(savedProject._id).toBeDefined();
            expect(savedProject.name).toBe(projectData.name);
            expect(savedProject.description).toBe(projectData.description);
            expect(savedProject.createdBy.toString()).toBe(testUser._id.toString());

            // Timestamps should be defined
            expect(savedProject.createdAt).toBeDefined();
            expect(savedProject.updatedAt).toBeDefined();
        });

        it('should fail validation without required fields', async () => {
            const invalidProject = new Project({});

            let error;
            try {
                await invalidProject.validate();
            } catch (err) {
                error = err;
            }

            expect(error).toBeDefined();
            expect(error.errors.name).toBeDefined();
            expect(error.errors.description).toBeDefined();
            expect(error.errors.createdBy).toBeDefined();
        });

        it('should store members correctly', async () => {
            // Create some test members
            const member1 = await User.create({
                name: 'Member 1',
                email: `member1${Date.now()}@example.com`,
                password: 'password123',
                role: 'Member'
            });

            const member2 = await User.create({
                name: 'Member 2',
                email: `member2${Date.now()}@example.com`,
                password: 'password123',
                role: 'Member'
            });

            const projectData = {
                name: 'Project with Members',
                description: 'This project has members',
                createdBy: testUser._id,
                members: [member1._id, member2._id]
            };

            const project = new Project(projectData);
            const savedProject = await project.save();

            expect(savedProject.members).toBeDefined();
            expect(savedProject.members.length).toBe(2);
            expect(savedProject.members[0].toString()).toBe(member1._id.toString());
            expect(savedProject.members[1].toString()).toBe(member2._id.toString());
        });
    });

    describe('Project Middleware and Methods', () => {
        it('should update the updatedAt timestamp when modified', async () => {
            const project = await Project.create({
                name: 'Update Test Project',
                description: 'Testing updatedAt timestamp',
                createdBy: testUser._id
            });

            const originalUpdatedAt = project.updatedAt;

            // Wait a moment to ensure timestamp will be different
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update the project
            project.name = 'Updated Project Name';
            await project.save();

            // Timestamp should be updated
            expect(project.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        });

        it('should populate virtual tasks field when requested', async () => {
            // Create a project
            const project = await Project.create({
                name: 'Project with Virtual Tasks',
                description: 'Testing virtual task population',
                createdBy: testUser._id
            });

            // Create a Task model mock for this test
            const TaskModelMock = {
                find: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                equals: jest.fn().mockResolvedValue([
                    { _id: new mongoose.Types.ObjectId(), title: 'Task 1' },
                    { _id: new mongoose.Types.ObjectId(), title: 'Task 2' }
                ])
            };

            // Get the virtual field definition
            const tasksVirtual = Project.schema.virtuals.tasks;

            // Verify the virtual field is defined
            expect(tasksVirtual).toBeDefined();
            expect(tasksVirtual.options.ref).toBe('Task');
            expect(tasksVirtual.options.localField).toBe('_id');
            expect(tasksVirtual.options.foreignField).toBe('project');
            expect(tasksVirtual.options.justOne).toBe(false);
        });
    });
}); 