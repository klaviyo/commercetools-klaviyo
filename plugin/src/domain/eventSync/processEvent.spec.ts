import { processEvent } from './processEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { AbstractEventProcessor } from './eventProcessors/abstractEventProcessor';
import { expect as exp } from 'chai';
import { responseHandler } from './responseHandler';
import mocked = jest.mocked;
import { KlaviyoService } from "../../infrastructure/driven/klaviyo/KlaviyoService";
import { KlaviyoEvent } from '../../types/klaviyo-plugin';

jest.mock('../../infrastructure/driven/klaviyo/KlaviyoSdkService');
jest.mock('./responseHandler');

describe('processEvent', () => {
    class TestEvent extends AbstractEventProcessor {
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

    const klaviyoServiceMock: jest.Mocked<KlaviyoService> = {
        sendEventToKlaviyo: jest.fn(),
        sendJobRequestToKlaviyo: jest.fn(),
        logRateLimitHeaders: jest.fn(),
        getKlaviyoProfileByExternalId: jest.fn(),
        getKlaviyoProfileByEmail: jest.fn(),
        getKlaviyoCategoryByExternalId: jest.fn(),
        getKlaviyoItemsByIds: jest.fn(),
        getKlaviyoItemVariantsByCtSkus: jest.fn(),
        getKlaviyoPaginatedCategories: jest.fn(),
        getKlaviyoPaginatedItems: jest.fn(),
        getKlaviyoItemByExternalId: jest.fn(),
        checkRateLimitsAndDelay: jest.fn(),
    };

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

        klaviyoServiceMock.sendEventToKlaviyo.mockReturnValueOnce(sendEventToKlaviyoResponse);
        responseHandlerMock.mockReturnValue({ status: 'OK' });

        const response = await processEvent(message, klaviyoServiceMock, [TestEvent]);

        exp(response).to.eql({ status: 'OK' });
        expect(klaviyoServiceMock.sendEventToKlaviyo).toHaveBeenCalledTimes(1);
        expect(klaviyoServiceMock.sendEventToKlaviyo).toHaveBeenCalledWith({
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

        const response = await processEvent(message, klaviyoServiceMock, [TestEvent]);

        exp(response).to.eql({ status: 'OK' });
        expect(klaviyoServiceMock.sendEventToKlaviyo).toHaveBeenCalledTimes(0);
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

        const response = await processEvent(message, klaviyoServiceMock, [TestEvent]);

        exp(response).to.eql({ status: '4xx' });
        expect(klaviyoServiceMock.sendEventToKlaviyo).toHaveBeenCalledTimes(0);
        expect(responseHandlerMock).toHaveBeenCalledTimes(2);
        expect(responseHandlerMock).toHaveBeenCalledWith(await Promise.allSettled([]), message);
    });
});
