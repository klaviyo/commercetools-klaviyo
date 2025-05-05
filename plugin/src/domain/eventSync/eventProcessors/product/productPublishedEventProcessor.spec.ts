import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { Context } from '../../../../types/klaviyo-context';
import { sampleProductPublishedMessage } from '../../../../test/testData/ctProductMessages';
import { ProductPublishedEventProcessor } from './productPublishedEventProcessor';
import { ItemVariantJobRequest } from '../../../../types/klaviyo-types';

jest.mock('../../../../infrastructure/driven/klaviyo/KlaviyoService');

const ctProductServiceMock = {
    getProductById: jest.fn(),
};

jest.mock('../../../../infrastructure/driven/commercetools/DefaultCtProductService', () => ({
    DefaultCtProductService: function () {
        return ctProductServiceMock;
    },
}));

const contextMock: DeepMockProxy<Context> = mockDeep<Context>();
const itemRequestMock = mock<any>();
const variantJobRequestMock = mock<ItemVariantJobRequest>();
const mockedProductId = 'mockedProductId';
itemRequestMock.data.id = mockedProductId;
contextMock.productMapper.mapCtProductToKlaviyoItem.mockImplementation(() => itemRequestMock);
contextMock.productMapper.mapCtProductVariantsToKlaviyoVariantsJob.mockImplementation(() => variantJobRequestMock);

describe('ProductPublishedEventProcessor > isEventValid', () => {
    it('should return valid when the product event has all the required fields', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'product' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'ProductPublished' }); //mock readonly property

        const event = ProductPublishedEventProcessor.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource     | type
        ${'invalid'} | ${'ProductPublished'}
        ${'product'} | ${'invalid'}
    `('should return invalid when is not a valid product ProductPublished message', ({ resource, type }) => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } });
        Object.defineProperty(ctMessageMock, 'type', { value: type });

        const event = ProductPublishedEventProcessor.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.false;
    });
});

describe('ProductPublishedEventProcessor > generateKlaviyoEvents', () => {
    it('should generate the klaviyo create item event and variant jobs when the input product is not found in klaviyo', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: { typeId: 'product', id: sampleProductPublishedMessage.resource.id },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'ProductPublished' }); //mock readonly property
        contextMock.ctProductService.getProductById.mockImplementationOnce(async () => ({
            masterData: {
                current: {
                    ...sampleProductPublishedMessage.productProjection as any,
                },
            },
        }) as any);
        // contextMock.klaviyoService.getKlaviyoItemByExternalId.mockResolvedValue({
        //     id: `$custom:::$default:::${sampleProductPublishedMessage.resource.id}`,
        // } as any);
        contextMock.klaviyoService.getKlaviyoItemByExternalId.mockResolvedValue(undefined);
        contextMock.klaviyoService.getKlaviyoItemVariantsByCtSkus.mockResolvedValue([]);
        const event = ProductPublishedEventProcessor.instance(ctMessageMock, contextMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(2);
    });

    it('should generate the klaviyo update item event and variant jobs when the input product is found in klaviyo', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: { typeId: 'product', id: sampleProductPublishedMessage.resource.id },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'ProductPublished' }); //mock readonly property
        contextMock.ctProductService.getProductById.mockImplementationOnce(async () => ({
            masterData: {
                current: {
                    ...sampleProductPublishedMessage.productProjection,
                },
            },
        }) as any);
        contextMock.klaviyoService.getKlaviyoItemByExternalId.mockResolvedValue({
            id: `$custom:::$default:::${sampleProductPublishedMessage.resource.id}`,
        } as any);
        contextMock.klaviyoService.getKlaviyoItemVariantsByCtSkus.mockResolvedValue([{
            id: `$custom:::$default:::${sampleProductPublishedMessage.productProjection.masterVariant.sku}`
        } as any]);
        const event = ProductPublishedEventProcessor.instance(ctMessageMock, contextMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(2);
    });
});
