import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { InventoryResourceUpdatedEventProcessor } from './inventoryResourceUpdatedEventProcessor';
import { Context } from '../../../../types/klaviyo-context';
import {
    sampleInventoryCreatedMessage,
    sampleInventoryResourceUpdatedMessage,
} from '../../../../test/testData/ctInventoryMessages';
import { ItemVariantRequest } from '../../../../types/klaviyo-types';

const ctProductServiceMock = {
    getInventoryEntryById: jest.fn(),
};

jest.mock('../../../../infrastructure/driven/commercetools/DefaultCtProductService', () => ({
    DefaultCtProductService: function () {
        return ctProductServiceMock;
    },
}));
jest.mock('../../../../infrastructure/driven/klaviyo/KlaviyoService');

const contextMock: DeepMockProxy<Context> = mockDeep<Context>();
const inventoryRequestMock = mock<ItemVariantRequest>();
inventoryRequestMock.data = {
    attributes: {
        published: true,
        inventoryPolicy: 1,
        inventoryQuantity: 100,
    },
    id: 'someId',
    type: 'catalog-variant',
};

contextMock.productMapper.mapCtInventoryEntryToKlaviyoVariant.mockImplementation(() => inventoryRequestMock);

describe('InventoryResourceUpdatedEventProcessor > isEventValid', () => {
    it('should return valid when the inventory event has all the required fields', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'inventory-entry' } });
        Object.defineProperty(ctMessageMock, 'notificationType', { value: 'ResourceUpdated' });
        Object.defineProperty(ctMessageMock, 'resourceUserProvidedIdentifiers', {
            value: {
                sku: 'someId',
            },
        });

        const event = InventoryResourceUpdatedEventProcessor.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource             | notificationType      | resourceUserProvidedIdentifiers
        ${'invalid'}         | ${'ResourceUpdated'}  | ${{ sku: 'someId' }}
        ${'inventory-entry'} | ${'invalid'}          | ${null}
        ${'inventory-entry'} | ${'ResouruceUpdated'} | ${null}
    `(
        'should return invalid when is not a valid inventory ResourceUpdated message',
        ({ resource, notificationType, resourceUserProvidedIdentifiers }) => {
            const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
            Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } });
            Object.defineProperty(ctMessageMock, 'notificationType', { value: notificationType });
            Object.defineProperty(ctMessageMock, 'resourceUserProvidedIdentifiers', {
                value: resourceUserProvidedIdentifiers,
            });

            const event = InventoryResourceUpdatedEventProcessor.instance(ctMessageMock, contextMock);

            exp(event.isEventValid()).to.be.false;
        },
    );
});

describe('InventoryResourceUpdatedEventProcessor > generateKlaviyoEvent', () => {
    it('should generate the klaviyo update variant event when the input inventory ResourceUpdated event is valid', async () => {
        const event = InventoryResourceUpdatedEventProcessor.instance(
            sampleInventoryResourceUpdatedMessage,
            contextMock,
        );
        contextMock.ctProductService.getInventoryEntryById.mockImplementation(
            async () => sampleInventoryCreatedMessage.inventoryEntry,
        );
        contextMock.klaviyoService.getKlaviyoItemVariantsByCtSkus.mockResolvedValue([
            {
                id: '$custom:::$default:someId',
            },
        ] as any);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(contextMock.productMapper.mapCtInventoryEntryToKlaviyoVariant).toBeCalledTimes(1);
        expect(contextMock.productMapper.mapCtInventoryEntryToKlaviyoVariant).toBeCalledWith(
            sampleInventoryCreatedMessage.inventoryEntry,
            { id: '$custom:::$default:someId' },
        );
        exp(klaviyoEvent[0].body.data.id).to.eq('someId');
    });

    it('should not generate events when the inventory_quantity is undefined', async () => {
        const event = InventoryResourceUpdatedEventProcessor.instance(
            sampleInventoryResourceUpdatedMessage,
            contextMock,
        );
        contextMock.ctProductService.getInventoryEntryById.mockImplementation(
            async () => sampleInventoryCreatedMessage.inventoryEntry,
        );
        contextMock.productMapper.mapCtInventoryEntryToKlaviyoVariant.mockImplementationOnce(() => ({
            data: {
                attributes: {
                    published: true,
                    inventory_policy: 1,
                    inventory_quantity: undefined,
                },
                id: 'someId',
                type: 'catalog-variant',
            },
        }));
        contextMock.klaviyoService.getKlaviyoItemVariantsByCtSkus.mockResolvedValue([
            {
                id: '$custom:::$default:someId',
            },
        ] as any);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(0);
        expect(contextMock.productMapper.mapCtInventoryEntryToKlaviyoVariant).toBeCalledTimes(1);
        expect(contextMock.productMapper.mapCtInventoryEntryToKlaviyoVariant).toBeCalledWith(
            sampleInventoryCreatedMessage.inventoryEntry,
            { id: '$custom:::$default:someId' },
        );
    });

    it('should not generate events when the variant for an inventory update is not found in klaviyo', async () => {
        const event = InventoryResourceUpdatedEventProcessor.instance(
            sampleInventoryResourceUpdatedMessage,
            contextMock,
        );
        contextMock.ctProductService.getInventoryEntryById.mockImplementation(
            async () => sampleInventoryCreatedMessage.inventoryEntry,
        );
        contextMock.klaviyoService.getKlaviyoItemVariantsByCtSkus.mockResolvedValue([]);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(0);
    });
});
