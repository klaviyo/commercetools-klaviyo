import { validateEnvironment } from './validate-configurations';

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
