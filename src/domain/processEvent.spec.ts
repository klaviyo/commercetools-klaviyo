import { processEvent } from './processEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { AbstractEvent } from './eventProcessors/abstractEvent';
import { sendEventToKlaviyo } from './klaviyoService';
import { expect as exp } from 'chai';
import { responseHandler } from './responseHandler';
import mocked = jest.mocked;

jest.mock('./klaviyoService');
jest.mock('./responseHandler');
describe('processEvent', () => {
    //todo mock api call to create klaviyo client

    class TestEvent extends AbstractEvent {
        generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
            return Promise.resolve([
                {
                    type: 'profileCreated',
                    body: {
                        data: {
                            type: 'profile',
                            attributes: {},
                        },
                    },
                },
            ]);
        }

        isEventValid(): boolean {
            return this.ctMessage.resource.typeId === 'order';
        }
    }

    const sendEventToKlaviyoMock = mocked(sendEventToKlaviyo);
    const responseHandlerMock = mocked(responseHandler);

    it('should process a valid event (order)', async () => {
        const message: MessageDeliveryPayload = {
            createdAt: '',
            id: '',
            lastModifiedAt: '',
            notificationType: 'Message',
            projectKey: '',
            resource: {
                typeId: 'order',
                id: 'someId',
            },
            resourceVersion: 0,
            sequenceNumber: 0,
            version: 0,
        };
        const sendEventToKlaviyoResponse = new Promise((resolve) => resolve('something'));
        sendEventToKlaviyoMock.mockReturnValueOnce(sendEventToKlaviyoResponse);
        responseHandlerMock.mockReturnValue({ status: 'OK' });

        const response = await processEvent(message, [TestEvent]);

        exp(response).to.eql({ status: 'OK' });
        expect(sendEventToKlaviyoMock).toHaveBeenCalledTimes(1);
        expect(sendEventToKlaviyoMock).toHaveBeenCalledWith({
            type: 'profileCreated',
            body: {
                data: {
                    type: 'profile',
                    attributes: {},
                },
            },
        });
        expect(responseHandlerMock).toHaveBeenCalledTimes(2);
        expect(responseHandlerMock).toHaveBeenCalledWith(
            await Promise.allSettled([sendEventToKlaviyoResponse]),
            message,
        );
    });

    it('should not process invalid events (quote)', async () => {
        const message: MessageDeliveryPayload = {
            createdAt: '',
            id: '',
            lastModifiedAt: '',
            notificationType: 'Message',
            projectKey: '',
            resource: {
                typeId: 'quote',
                id: 'someId',
            },
            resourceVersion: 0,
            sequenceNumber: 0,
            version: 0,
        };
        responseHandlerMock.mockReturnValue({ status: 'OK' });

        const response = await processEvent(message, [TestEvent]);

        exp(response).to.eql({ status: 'OK' });
        expect(sendEventToKlaviyoMock).toHaveBeenCalledTimes(0);
        expect(responseHandlerMock).toHaveBeenCalledTimes(2);
        expect(responseHandlerMock).toHaveBeenCalledWith(await Promise.allSettled([]), message);
    });

    it('should return error when fails to generate the klaviyo event', async () => {
        const message: MessageDeliveryPayload = {
            createdAt: '',
            id: '',
            lastModifiedAt: '',
            notificationType: 'Message',
            projectKey: '',
            resource: {
                typeId: 'quote',
                id: 'someId',
            },
            resourceVersion: 0,
            sequenceNumber: 0,
            version: 0,
        };
        responseHandlerMock.mockReturnValueOnce({ status: 'OK' }).mockReturnValueOnce({ status: '4xx' });

        const response = await processEvent(message, [TestEvent]);

        exp(response).to.eql({ status: '4xx' });
        expect(sendEventToKlaviyoMock).toHaveBeenCalledTimes(0);
        expect(responseHandlerMock).toHaveBeenCalledTimes(2);
        expect(responseHandlerMock).toHaveBeenCalledWith(await Promise.allSettled([]), message);
    });
});
