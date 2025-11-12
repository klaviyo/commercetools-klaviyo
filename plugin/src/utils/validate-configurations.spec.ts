import config from 'config';
import { validateEnvironment, validateDeduplicationConfig } from './validate-configurations';

jest.mock('config');

describe('validateEnvironment', () => {
    it('should exit without issues if all required env variables are defined', async () => {
        let error;
        try {
            validateEnvironment();
        } catch (err) {
            error = err
        }
        expect(error).toBeUndefined();
    });

    it('should throw error if one or more required env variables are undefined', async () => {
        let error: any;
        process.env.CT_API_URL = '';
        process.env.CT_API_CLIENT = '{abc}';
        try {
            validateEnvironment();
        } catch (err) {
            error = err
        }
        expect(error).toBeDefined();
        expect(error.message).toBeDefined();
        expect(error.errors).toBeDefined();
        expect(error.errors.length).toBeGreaterThanOrEqual(1);
    });
});

describe('validateDeduplicationConfig', () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should pass validation when deduplication config is valid', () => {
        (config.has as jest.Mock).mockImplementation((key: string) => key === 'customer.deduplication');
        (config.get as jest.Mock).mockImplementation((key: string) => {
            if (key === 'customer.deduplication') return { enabled: false };
            if (key === 'customer.deduplication.enabled') return false;
            return undefined;
        });

        let error;
        try {
            validateDeduplicationConfig();
        } catch (err) {
            error = err;
        }

        expect(error).toBeUndefined();
    });

    it('should pass validation when deduplication config does not exist', () => {
        (config.has as jest.Mock).mockReturnValue(false);

        let error;
        try {
            validateDeduplicationConfig();
        } catch (err) {
            error = err;
        }

        expect(error).toBeUndefined();
    });

    it('should throw error when enabled field is missing', () => {
        (config.has as jest.Mock).mockImplementation((key: string) => key === 'customer.deduplication');
        (config.get as jest.Mock).mockImplementation((key: string) => {
            if (key === 'customer.deduplication') return {};
            return undefined;
        });

        let error: any;
        try {
            validateDeduplicationConfig();
        } catch (err) {
            error = err;
        }

        expect(error).toBeDefined();
        expect(error.message).toContain('Invalid deduplication configuration');
        expect(error.errors).toContain('customer.deduplication.enabled is required when customer.deduplication is configured.');
    });

    it('should throw error when enabled is not a boolean', () => {
        (config.has as jest.Mock).mockImplementation((key: string) => key === 'customer.deduplication');
        (config.get as jest.Mock).mockImplementation((key: string) => {
            if (key === 'customer.deduplication') return { enabled: 'true' };
            if (key === 'customer.deduplication.enabled') return 'true';
            return undefined;
        });

        let error: any;
        try {
            validateDeduplicationConfig();
        } catch (err) {
            error = err;
        }

        expect(error).toBeDefined();
        expect(error.errors).toContain('customer.deduplication.enabled must be a boolean value.');
    });
});
