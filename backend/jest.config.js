module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/logs/',
        '/coverage/',
        '/uploads/'
    ],
    testPathIgnorePatterns: [
        '/node_modules/'
    ],
    coverageReporters: ['text', 'lcov', 'clover', 'html'],
    testTimeout: 10000,
    // Set up different test environments
    projects: [
        {
            displayName: 'unit',
            testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
            setupFilesAfterEnv: ['<rootDir>/tests/setup/unitTestSetup.js']
        },
        {
            displayName: 'integration',
            testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
            setupFilesAfterEnv: ['<rootDir>/tests/setup/integrationTestSetup.js']
        }
    ]
}; 