const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars
dotenv.config();

// Load models
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Read JSON files
const users = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8')
);

const projects = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf-8')
);

const tasks = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'tasks.json'), 'utf-8')
);

// Import into DB
const importData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Project.deleteMany();
        await Task.deleteMany();

        console.log('Data cleared...'.yellow);

        // Create users first
        const createdUsers = await User.create(users);
        console.log(`${createdUsers.length} users created...`.green);

        // Map user IDs for reference in projects
        const adminUser = createdUsers[0]._id;
        const managerUser = createdUsers[1]._id;
        const memberUser = createdUsers[2]._id;

        // Add user IDs to projects
        const projectsWithUsers = projects.map(project => {
            return {
                ...project,
                createdBy: adminUser,
                members: [managerUser, memberUser]
            };
        });

        // Create projects
        const createdProjects = await Project.create(projectsWithUsers);
        console.log(`${createdProjects.length} projects created...`.green);

        // Add project and user IDs to tasks
        const tasksWithReferences = tasks.map((task, index) => {
            return {
                ...task,
                project: createdProjects[index % createdProjects.length]._id,
                assignee: index % 2 === 0 ? managerUser : memberUser,
                reporter: adminUser
            };
        });

        // Create tasks
        const createdTasks = await Task.create(tasksWithReferences);
        console.log(`${createdTasks.length} tasks created...`.green);

        console.log('Data Imported...'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(`${err}`.red);
        process.exit(1);
    }
};

// Delete data
const deleteData = async () => {
    try {
        await User.deleteMany();
        await Project.deleteMany();
        await Task.deleteMany();

        console.log('Data Destroyed...'.red.inverse);
        process.exit();
    } catch (err) {
        console.error(`${err}`.red);
        process.exit(1);
    }
};

// Command line arguments
if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
} else {
    console.log('Please provide a valid argument: -i (import) or -d (destroy)'.yellow);
    process.exit();
} 