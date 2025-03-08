/**
 * Development Environment Setup Script
 * 
 * This script helps set up and run the task management application in development mode.
 * It handles starting both backend and frontend with correct environment configuration.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Check if directory exists
const directoryExists = (dirPath) => {
    try {
        return fs.statSync(dirPath).isDirectory();
    } catch (err) {
        return false;
    }
};

// Log with timestamp and color
const log = (message, color = colors.reset) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
};

// Run a command in a specific directory
const runCommand = (command, args, cwd, env = process.env) => {
    const fullEnv = { ...process.env, ...env };

    log(`Starting: ${command} ${args.join(' ')}`, colors.cyan);
    log(`Working directory: ${cwd}`, colors.blue);

    const childProcess = spawn(command, args, {
        cwd,
        env: fullEnv,
        shell: process.platform === 'win32',
        stdio: 'inherit'
    });

    return new Promise((resolve, reject) => {
        childProcess.on('error', (error) => {
            log(`Error executing command: ${error.message}`, colors.red);
            reject(error);
        });

        childProcess.on('exit', (code) => {
            if (code === 0) {
                log(`Command completed successfully`, colors.green);
                resolve();
            } else {
                log(`Command exited with code ${code}`, colors.red);
                reject(new Error(`Process exited with code ${code}`));
            }
        });
    });
};

// Main function
async function main() {
    const rootDir = process.cwd();
    const backendDir = path.join(rootDir, 'backend');
    const frontendDir = path.join(rootDir, 'frontend');

    // Check if directories exist
    if (!directoryExists(backendDir)) {
        log('Backend directory not found!', colors.red);
        process.exit(1);
    }

    if (!directoryExists(frontendDir)) {
        log('Frontend directory not found!', colors.red);
        process.exit(1);
    }

    // Start backend
    log('Starting backend server...', colors.magenta);
    const backendProcess = spawn(
        'npm',
        ['start'],
        {
            cwd: backendDir,
            shell: process.platform === 'win32',
            stdio: 'inherit'
        }
    );

    backendProcess.on('error', (error) => {
        log(`Backend error: ${error.message}`, colors.red);
    });

    // Wait a bit for backend to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start frontend with OpenSSL legacy provider
    log('Starting frontend development server...', colors.yellow);
    const frontendProcess = spawn(
        'npm',
        ['start'],
        {
            cwd: frontendDir,
            env: {
                ...process.env,
                NODE_OPTIONS: '--openssl-legacy-provider'
            },
            shell: process.platform === 'win32',
            stdio: 'inherit'
        }
    );

    frontendProcess.on('error', (error) => {
        log(`Frontend error: ${error.message}`, colors.red);
    });

    // Handle process termination
    const cleanup = () => {
        log('Shutting down servers...', colors.cyan);
        backendProcess.kill();
        frontendProcess.kill();
        process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    log('Development environment is running!', colors.green);
    log('Backend server: http://localhost:5000', colors.blue);
    log('Frontend application: http://localhost:3000', colors.blue);
}

// Run the script
main().catch(error => {
    log(`Error: ${error.message}`, colors.red);
    process.exit(1);
}); 