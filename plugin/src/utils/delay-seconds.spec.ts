import { delaySeconds } from './delay-seconds';

describe('delaySeconds', () => {
    it('should delay program flow execution by N seconds', async () => {
        let error;
        try {
            await delaySeconds(1);
        } catch (err) {
            error = err
        }
        expect(error).toBeUndefined();
    });
});
