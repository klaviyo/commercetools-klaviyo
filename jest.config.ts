import type { JestConfigWithTsJest } from 'ts-jest';
import type { Config } from '@jest/types';

const jestConfig: Config.InitialOptions = {
    // extensionsToTreatAsEsm: ['.ts'],
    preset: 'ts-jest',
    testMatch: ['**/*.spec.ts'],
    testEnvironment: 'node',

    // Automatically clear mock calls, instances, contexts and results before every test
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/node_modules/'],
    coverageProvider: 'v8',
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },

    setupFiles: ['dotenv/config'],
};

export default jestConfig;
