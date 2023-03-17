import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { CategoryResourceDeletedEventProcessor } from './categoryResourceDeletedEventProcessor';
import { Context } from '../../../../types/klaviyo-context';
import { sampleCategoryResourceDeletedMessage } from '../../../../test/testData/ctCategoryMessages';

jest.mock('../../../../infrastructure/driven/klaviyo/KlaviyoService');

const contextMock: DeepMockProxy<Context> = mockDeep<Context>();

describe('CategoryResourceDeletedEventProcessor > isEventValid', () => {
    it('should return valid when the cattegory event has all the required fields', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'category' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'notificationType', { value: 'ResourceDeleted' });

        const event = CategoryResourceDeletedEventProcessor.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource      | notificationType
        ${'invalid'}  | ${'ResourceDeleted'}
        ${'category'} | ${'invalid'}
    `(
        'should return invalid when is not a valid category ResourceDeleted message',
        ({ resource, notificationType }) => {
            const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
            Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } });
            Object.defineProperty(ctMessageMock, 'notificationType', { value: notificationType });

            const event = CategoryResourceDeletedEventProcessor.instance(ctMessageMock, contextMock);

            exp(event.isEventValid()).to.be.false;
        },
    );
});

describe('CategoryResourceDeletedEventProcessor > generateKlaviyoEvents', () => {
    it('should generate the klaviyo delete category event when the input category ResourceDeleted event is valid', async () => {
        const event = CategoryResourceDeletedEventProcessor.instance(sampleCategoryResourceDeletedMessage, contextMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
    });
});
