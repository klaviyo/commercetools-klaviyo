import { sendEventToKlaviyo } from './klaviyoService';
import { Events, Profiles } from 'klaviyo-api';
import { mockDeep } from 'jest-mock-extended';

jest.mock('klaviyo-api', () => {
    const module = jest.createMockFromModule<any>('klaviyo-api');
    module.Profiles.createProfile = jest.fn();
    module.Events.createEvent = jest.fn();
    return module;
});

describe('klaviyoService > sendEventToKlaviyo', () => {
    test("should create a profile in klaviyo when the input event is of type 'profileCreated'", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'profileCreated',
            body: {
                data: {
                    type: 'profile',
                    attributes: {},
                },
            },
        };

        await sendEventToKlaviyo(klaviyoEvent);

        expect(Profiles.createProfile).toBeCalledTimes(1);
        expect(Profiles.createProfile).toBeCalledWith(klaviyoEvent.body);
    });

    test("should create an event in klaviyo when the input event is of type 'event'", async () => {
        const eventTypeMock: EventType = mockDeep<EventType>();

        const klaviyoEvent: KlaviyoEvent = {
            type: 'event',
            body: {
                data: eventTypeMock,
            },
        };

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
