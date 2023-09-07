import type { Config } from '@jest/types';

const jestConfig: Config.InitialOptions = {
    roots: ['src'],
    preset: 'ts-jest',
    testMatch: ['**/*.spec.ts'],
    testEnvironment: 'node',

    // Automatically clear mock calls, instances, contexts and results before every test
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!**/node_modules/**', '!src/test/**/*.{ts,tsx}', '!src/types/**/*.{ts,tsx}'],
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    setupFiles: ['<rootDir>/jest.setup.ts'],
    // setupFiles: ['dotenv/config'],
};

export default jestConfig;
