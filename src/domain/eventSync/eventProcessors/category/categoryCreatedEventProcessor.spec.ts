import { expect as exp } from 'chai';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { CategoryCreatedEventProcessor } from './categoryCreatedEventProcessor';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { Context } from '../../../../types/klaviyo-context';
import { sampleCategoryCreatedMessage } from '../../../../test/testData/ctCategoryMessages';

const contextMock: DeepMockProxy<Context> = mockDeep<Context>();
const categoryRequestMock = mock<CategoryRequest>();
const mockedCategoryId = "mockedCategoryId";
categoryRequestMock.data.id = mockedCategoryId;
contextMock.categoryMapper.mapCtCategoryToKlaviyoCategory.mockImplementation((category) => categoryRequestMock);

describe('categoryCreatedEventProcessor > isEventValid', () => {
    it('should return valid when is a CategoryCreated message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'category' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'CategoryCreated' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'category', { value: { id: '123-1230-123' } }); //mock readonly property

        const event = CategoryCreatedEventProcessor.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource     | type                  | category
        ${'invalid'} | ${'CategoryCreated'}  | ${{ id: '123-1230-123' }}
        ${'category'}| ${'invalid'}          | ${{}}
    `(
        'should return invalid when is not a CategoryCreated message, resource: $resource type: $type',
        ({ resource, type, category }) => {
            const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
            Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'type', { value: type }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'category', { value: category }); //mock readonly property

            const event = CategoryCreatedEventProcessor.instance(ctMessageMock, contextMock);

            exp(event.isEventValid()).to.be.false;
        },
    );
});

describe('categoryCreatedEventProcessor > generateKlaviyoEvents', () => {
    it('should generate the klaviyo event for a CategoryCreated message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'category' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'CategoryCreated' }); //mock readonly property
        const category = {
                id: '123-123-123',
                name: {
                    en: "Test"
                },
                createdAt: '2023-01-27T15:00:00.000Z',
        }
        Object.defineProperty(ctMessageMock, 'category', { value: category }); //mock readonly property

        const event = CategoryCreatedEventProcessor.instance(ctMessageMock, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.eq(1);
        expect(contextMock.categoryMapper.mapCtCategoryToKlaviyoCategory).toBeCalledTimes(1);
        expect(contextMock.categoryMapper.mapCtCategoryToKlaviyoCategory).toBeCalledWith(category);
        exp(klaviyoEvent[0].body.data.id).to.eq(mockedCategoryId)
    });

    it('should generate the klaviyo event when category is not in the message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'category', id: '3456789' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'CategoryCreated' }); //mock readonly property
        contextMock.ctCategoryService.getCategoryById.mockImplementation(async (id) => sampleCategoryCreatedMessage.category);

        const event = CategoryCreatedEventProcessor.instance(ctMessageMock, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.eq(1);
        expect(contextMock.categoryMapper.mapCtCategoryToKlaviyoCategory).toBeCalledTimes(1);
        exp(klaviyoEvent[0].body.data.id).to.eq(mockedCategoryId)

    });
});
