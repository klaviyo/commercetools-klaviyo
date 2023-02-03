import { sendEventToKlaviyo } from './klaviyoService';
import { Events, Profiles } from 'klaviyo-api';

jest.mock('klaviyo-api', () => {
    const module = jest.createMockFromModule<any>('klaviyo-api');
    module.Profiles.createProfile = jest.fn();
    module.Events.createEvent = jest.fn();
    return module;
});

describe('klaviyoService > sendEventToKlaviyo', () => {
    test("should create a profile in klaviyo when the input event is of type 'profileCreated'", async () => {
        const klaviyoEvent: KlaviyoEvent = { type: 'profileCreated', body: { email: 'test@klaviyo.com' } };

        await sendEventToKlaviyo(klaviyoEvent);

        expect(Profiles.createProfile).toBeCalledTimes(1);
        expect(Profiles.createProfile).toBeCalledWith(klaviyoEvent.body);
    });

    test("should create an event in klaviyo when the input event is of type 'event'", async () => {
        const klaviyoEvent: KlaviyoEvent = { type: 'event', body: { orderId: '1234567' } };

        await sendEventToKlaviyo(klaviyoEvent);

        expect(Events.createEvent).toBeCalledTimes(1);
        expect(Events.createEvent).toBeCalledWith(klaviyoEvent.body);
    });

    test('should throw error when the input event type is not supported', async () => {
        const klaviyoEvent = { type: 'invalid', body: {} };

        await expect(sendEventToKlaviyo(klaviyoEvent as KlaviyoEvent)).rejects.toThrow(Error);
        expect(Events.createEvent).toBeCalledTimes(0);
        expect(Profiles.createProfile).toBeCalledTimes(0);
    });
});
