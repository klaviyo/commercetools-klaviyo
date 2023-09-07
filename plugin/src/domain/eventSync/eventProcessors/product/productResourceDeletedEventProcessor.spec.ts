import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { ProductResourceDeletedEventProcessor } from './productResourceDeletedEventProcessor';
import { Context } from '../../../../types/klaviyo-context';
import { sampleProductResourceDeletedMessage } from '../../../../test/testData/ctProductMessages';

jest.mock('../../../../infrastructure/driven/klaviyo/KlaviyoService');

const contextMock: DeepMockProxy<Context> = mockDeep<Context>();

describe('ProductResourceDeletedEventProcessor > isEventValid', () => {
    it('should return valid when the category event has all the required fields', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'product' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'notificationType', { value: 'ResourceDeleted' });

        const event = ProductResourceDeletedEventProcessor.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource      | notificationType
        ${'invalid'}  | ${'ResourceDeleted'}
        ${'product'}  | ${'invalid'}
    `(
        'should return invalid when is not a valid product ResourceDeleted message',
        ({ resource, notificationType }) => {
            const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
            Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } });
            Object.defineProperty(ctMessageMock, 'notificationType', { value: notificationType });

            const event = ProductResourceDeletedEventProcessor.instance(ctMessageMock, contextMock);

            exp(event.isEventValid()).to.be.false;
        },
    );
});

describe('ProductResourceDeletedEventProcessor > generateKlaviyoEvents', () => {
    it('should generate the klaviyo delete product event when the input product ResourceDeleted event is valid', async () => {
        contextMock.klaviyoService.getKlaviyoItemVariantsByCtSkus.mockResolvedValue([]);
        const event = ProductResourceDeletedEventProcessor.instance(sampleProductResourceDeletedMessage, contextMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
    });

    it('should generate the klaviyo delete product event and delete variants when they are found in klaviyo', async () => {
        contextMock.klaviyoService.getKlaviyoItemVariantsByCtSkus.mockResolvedValue([
            {
                id: 'test-id',
            } as any,
        ]);
        const event = ProductResourceDeletedEventProcessor.instance(sampleProductResourceDeletedMessage, contextMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
    });
});
