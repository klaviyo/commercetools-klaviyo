import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { CategoryResourceUpdatedEventProcessor } from './categoryResourceUpdatedEventProcessor';
import { getSampleCustomerResourceUpdatedMessage } from '../../../../test/testData/ctCustomerMessages';
import { Context } from '../../../../types/klaviyo-context';
import { sampleCategoryCreatedMessage } from '../../../../test/testData/ctCategoryMessages';

const ctCategoryServiceMock = {
    getCategoryById: jest.fn(),
}

jest.mock('../../../../infrastructure/driven/commercetools/DefaultCtCategoryService', () => ({
    DefaultCtCategoryService: function() {
        return ctCategoryServiceMock;
    }
}));
jest.mock('../../../../infrastructure/driven/klaviyo/KlaviyoService');

const contextMock: DeepMockProxy<Context> = mockDeep<Context>();
const categoryRequestMock = mock<CategoryRequest>();
categoryRequestMock.data = {
    attributes: {
        external_id: 'someId',
        name: 'someName',
        integration_type: '$custom',
        catalog_type: '$default',
    },
    id: 'someId',
    type: 'catalog-category',
};

contextMock.categoryMapper.mapCtCategoryToKlaviyoCategory.mockImplementation(
    (category, klaviyoCategoryId) => categoryRequestMock,
);

describe('CategoryResourceUpdatedEventProcessor > isEventValid', () => {
    it('should return valid when the category event has all the required fields', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'category' } });
        Object.defineProperty(ctMessageMock, 'notificationType', { value: 'ResourceUpdated' });

        const event = CategoryResourceUpdatedEventProcessor.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource      | notificationType
        ${'invalid'}  | ${'ResourceUpdated'}
        ${'category'} | ${'invalid'}
    `(
        'should return invalid when is not a valid category ResourceUpdated message',
        ({ resource, notificationType }) => {
            const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
            Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } });
            Object.defineProperty(ctMessageMock, 'notificationType', { value: notificationType });

            const event = CategoryResourceUpdatedEventProcessor.instance(ctMessageMock, contextMock);

            exp(event.isEventValid()).to.be.false;
        },
    );
});

describe('CategoryResourceUpdatedEventProcessor > generateKlaviyoEvent', () => {
    it('should generate the klaviyo update category event when the input category ResourceUpdated event is valid', async () => {
        const inputMessage = getSampleCustomerResourceUpdatedMessage();
        const message = inputMessage as unknown as MessageDeliveryPayload;
        const event = CategoryResourceUpdatedEventProcessor.instance(message, contextMock);
        contextMock.ctCategoryService.getCategoryById.mockImplementation(async (id) => sampleCategoryCreatedMessage.category);
        contextMock.klaviyoService.getKlaviyoCategoryByExternalId.mockResolvedValue({
            attributes: {
                external_id: 'someId',
                name: 'someName',
                integration_type: '$custom',
                catalog_type: '$default',
            },
            id: 'someId',
            type: 'catalog-category',
        });

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(contextMock.categoryMapper.mapCtCategoryToKlaviyoCategory).toBeCalledTimes(1);
        expect(contextMock.categoryMapper.mapCtCategoryToKlaviyoCategory).toBeCalledWith(sampleCategoryCreatedMessage.category, 'someId');
        exp(klaviyoEvent[0].body.data.id).to.eq('someId');
    });

    it('should generate the klaviyo create profile event when the input category ResourceUpdated event is valid and the category is not found in Klaviyo', async () => {
        const inputMessage = getSampleCustomerResourceUpdatedMessage();
        const message = inputMessage as unknown as MessageDeliveryPayload;
        const event = CategoryResourceUpdatedEventProcessor.instance(message, contextMock);
        contextMock.ctCategoryService.getCategoryById.mockImplementation(async (id) => sampleCategoryCreatedMessage.category);
        contextMock.klaviyoService.getKlaviyoCategoryByExternalId.mockResolvedValue(undefined);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(contextMock.categoryMapper.mapCtCategoryToKlaviyoCategory).toBeCalledTimes(1);
        expect(contextMock.categoryMapper.mapCtCategoryToKlaviyoCategory).toBeCalledWith(sampleCategoryCreatedMessage.category);
        exp(klaviyoEvent[0].body.data.id).to.eq('someId');
    });
});
