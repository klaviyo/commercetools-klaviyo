import type { Config } from '@jest/types';

const jestConfig: Config.InitialOptions = {
    roots: ['src'],
    preset: 'ts-jest',
    testMatch: ['**/*.spec.ts'],
    testEnvironment: 'node',

    // Automatically clear mock calls, instances, contexts and results before every test
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!**/node_modules/**',
        '!src/test/**/*.{ts,tsx}',
        '!src/types/**/*.{ts,tsx}',
        '!src/domain/shared/mappers/*.ts',
        'src/domain/shared/mappers/Default*Mapper.ts',
        '!src/infrastructure/driven/commercetools/*.ts',
        'src/infrastructure/driven/commercetools/Default*Service.ts',
        '!src/domain/shared/services/CurrencyService.ts',
        '!src/domain/bulkSync/services/LockService.ts',
        '!src/infrastructure/driving/adapter/eventSync/genericAdapter.ts',
        '!src/infrastructure/driving/adapter/eventSync/sqsAdapter.ts',
        '!src/index.ts',
    ],
    coverageDirectory: 'coverage',
    coverageProvider: 'babel',
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
