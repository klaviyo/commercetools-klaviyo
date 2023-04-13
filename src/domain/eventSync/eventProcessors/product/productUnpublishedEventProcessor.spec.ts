import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { ProductUnpublishedEventProcessor } from './productUnpublishedEventProcessor';
import { Context } from '../../../../types/klaviyo-context';
import { sampleProductUnpublishedMessage } from '../../../../test/testData/ctProductMessages';

jest.mock('../../../../infrastructure/driven/klaviyo/KlaviyoService');

const contextMock: DeepMockProxy<Context> = mockDeep<Context>();

describe('ProductUnpublishedEventProcessor > isEventValid', () => {
    it('should return valid when the category event has all the required fields', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'product' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'ProductUnpublished' });

        const event = ProductUnpublishedEventProcessor.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource      | type
        ${'invalid'}  | ${'ResourceUnpublished'}
        ${'product'}  | ${'invalid'}
    `(
        'should return invalid when is not a valid product ResourceUnpublished message',
        ({ resource, type }) => {
            const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
            Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } });
            Object.defineProperty(ctMessageMock, 'type', { value: type });

            const event = ProductUnpublishedEventProcessor.instance(ctMessageMock, contextMock);

            exp(event.isEventValid()).to.be.false;
        },
    );
});

describe('ProductUnpublishedEventProcessor > generateKlaviyoEvents', () => {
    it('should generate the klaviyo delete product event when the input product unpublished event is valid', async () => {
        const event = ProductUnpublishedEventProcessor.instance(sampleProductUnpublishedMessage as any, contextMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
    });
});
