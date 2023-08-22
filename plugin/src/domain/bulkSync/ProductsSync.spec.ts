import { ProductsSync } from './ProductsSync';
import { KlaviyoSdkService } from '../../infrastructure/driven/klaviyo/KlaviyoSdkService';
import { CTCustomObjectLockService } from './services/CTCustomObjectLockService';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { Product, ProductVariant } from '@commercetools/platform-sdk';
import { ErrorCodes, StatusError } from '../../types/errors/StatusError';
import { DefaultCtProductService } from '../../infrastructure/driven/commercetools/DefaultCtProductService';
import { DefaultProductMapper } from '../shared/mappers/DefaultProductMapper';
import logger from '../../utils/log';

const mockCtCustomObjectLockService: DeepMockProxy<CTCustomObjectLockService> = mockDeep<CTCustomObjectLockService>();
const mockDefaultProductMapper: DeepMockProxy<DefaultProductMapper> = mockDeep<DefaultProductMapper>();
const mockKlaviyoSdkService: DeepMockProxy<KlaviyoSdkService> = mockDeep<KlaviyoSdkService>();
const mockDefaultCtProductService: DeepMockProxy<DefaultCtProductService> = mockDeep<DefaultCtProductService>();

const historicalProducts = new ProductsSync(
    mockCtCustomObjectLockService,
    mockDefaultProductMapper,
    mockKlaviyoSdkService,
    mockDefaultCtProductService,
);

describe('syncAllProducts', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should create a product and a variant in klaviyo when CT returns a single product with one variant', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();
        mockKlaviyoSdkService.sendJobRequestToKlaviyo.mockResolvedValueOnce({
            body: {
                data: {
                    attributes: {
                        completed_count: 1,
                        failed_count: 0,
                    },
                },
            },
        });
        mockKlaviyoSdkService.getKlaviyoItemsByIds.mockResolvedValueOnce([]);
        mockKlaviyoSdkService.getKlaviyoItemVariantsByCtSkus.mockResolvedValueOnce([]);

        const mockProduct = mock<Product>();
        const mockVariant = mock<ProductVariant>();
        Object.defineProperty(mockProduct, 'id', { value: 'test-id' });
        Object.defineProperty(mockVariant, 'sku', { value: 'test-id' });
        Object.defineProperty(mockVariant, 'prices', {
            value: [
                {
                    id: '58cf4f29-f55b-40a2-9360-97a15ee0a609',
                    value: {
                        type: 'centPrecision',
                        currencyCode: 'EUR',
                        centAmount: 500,
                        fractionDigits: 2,
                    },
                },
                {
                    id: '6c61ed1b-f2d7-47a6-b536-2cb8f7156019',
                    value: {
                        type: 'centPrecision',
                        currencyCode: 'EUR',
                        centAmount: 2000,
                        fractionDigits: 2,
                    },
                    validUntil: '2023-05-11T04:00:00.000Z',
                },
                {
                    id: 'fe328c80-9524-4232-a0d6-ab166df13b27',
                    value: {
                        type: 'centPrecision',
                        currencyCode: 'EUR',
                        centAmount: 500,
                        fractionDigits: 2,
                    },
                    validFrom: '2023-05-11T04:00:00.000Z',
                },
                {
                    id: '35bca0a3-d0f8-4431-8b2f-d4bb2635de73',
                    value: {
                        type: 'centPrecision',
                        currencyCode: 'EUR',
                        centAmount: 12200,
                        fractionDigits: 2,
                    },
                    channel: {
                        typeId: 'channel',
                        id: '03c22295-79b0-4838-bc4c-9724133a27ce',
                    },
                },
            ],
        })
        Object.defineProperty(mockProduct, 'masterData', {
            value: {
                current: {
                    masterVariant: mockVariant,
                    variants: [mockVariant],
                },
            },
        });
        mockDefaultCtProductService.getAllProducts.mockResolvedValueOnce({ data: [mockProduct], hasMore: false });

        await historicalProducts.syncAllProducts();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtProductService.getAllProducts).toBeCalledTimes(1);
        expect(mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob).toBeCalledTimes(1);
        expect(mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob).toBeCalledWith([mockProduct], 'itemCreated');
        expect(mockDefaultProductMapper.mapCtProductVariantsToKlaviyoVariantsJob).toBeCalledTimes(1);
        expect(mockDefaultProductMapper.mapCtProductVariantsToKlaviyoVariantsJob).toBeCalledWith(
            mockProduct,
            [mockVariant, mockVariant],
            'variantCreated',
        );
        expect(mockKlaviyoSdkService.sendJobRequestToKlaviyo).toBeCalledTimes(2);
    });

    it('should send 1 item creation request to klaviyo when CT returns 10 products with pagination', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();
        for (let i = 0; i < 10; i++) {
            mockKlaviyoSdkService.getKlaviyoItemsByIds.mockResolvedValueOnce([]);
            mockKlaviyoSdkService.getKlaviyoItemVariantsByCtSkus.mockResolvedValueOnce([]);
            mockDefaultProductMapper.mapCtProductVariantsToKlaviyoVariantsJob.mockImplementationOnce(() => ({
                data: {
                    type: 'catalog-variant-bulk-create-job',
                    attributes: {
                        variants: [{ type: 'catalog-variant', id: 'test-id', attributes: {} as any }],
                    },
                },
            }));
        }
        mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob.mockImplementationOnce(() => ({
            data: {
                type: 'catalog-item-bulk-create-job',
                attributes: {
                    items: Array(6).fill({ type: 'catalog-item', id: 'test-id' }),
                },
            },
        }));
        mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob.mockImplementationOnce(() => ({
            data: {
                type: 'catalog-item-bulk-create-job',
                attributes: {
                    items: Array(4).fill({ type: 'catalog-item', id: 'test-id' }),
                },
            },
        }));

        const mockProduct = mock<Product>();
        Object.defineProperty(mockProduct, 'masterData', {
            value: {
                current: {
                    variants: [],
                    masterVariant: {},
                },
            },
        });
        Object.defineProperty(mockProduct, 'id', { value: 'test-id' });
        mockDefaultCtProductService.getAllProducts.mockResolvedValueOnce({
            data: Array(6).fill(mockProduct),
            hasMore: true,
        });
        mockDefaultCtProductService.getAllProducts.mockResolvedValueOnce({
            data: Array(4).fill(mockProduct),
            hasMore: false,
        });

        await historicalProducts.syncAllProducts();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtProductService.getAllProducts).toBeCalledTimes(2);
        expect(mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob).toBeCalledTimes(2);
        expect(mockKlaviyoSdkService.sendJobRequestToKlaviyo).toBeCalledTimes(2);
    });

    it('should send 1 item update and 1 variant update request to klaviyo when CT returns 10 products with pagination', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();
        mockKlaviyoSdkService.sendJobRequestToKlaviyo.mockResolvedValueOnce({
            body: {
                data: {
                    attributes: {
                        completed_count: 1,
                        failed_count: 0,
                    },
                },
            },
        });
        mockKlaviyoSdkService.getKlaviyoItemsByIds.mockResolvedValueOnce([
            {
                id: '$custom:::$default:::test-id',
            } as any,
        ]);
        mockKlaviyoSdkService.getKlaviyoItemVariantsByCtSkus.mockResolvedValueOnce([
            {
                id: '$custom:::$default:::test-id',
            } as any,
        ]);

        const mockProduct = mock<Product>();
        const mockVariant = mock<ProductVariant>();
        Object.defineProperty(mockProduct, 'id', { value: 'test-id' });
        Object.defineProperty(mockVariant, 'sku', { value: 'test-id' });
        Object.defineProperty(mockProduct, 'masterData', {
            value: {
                current: {
                    masterVariant: mockVariant,
                    variants: [mockVariant],
                },
            },
        });
        mockDefaultCtProductService.getAllProducts.mockResolvedValueOnce({ data: [mockProduct], hasMore: false });

        await historicalProducts.syncAllProducts();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtProductService.getAllProducts).toBeCalledTimes(1);
        expect(mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob).toBeCalledTimes(1);
        expect(mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob).toBeCalledWith([mockProduct], 'itemUpdated');
        expect(mockDefaultProductMapper.mapCtProductVariantsToKlaviyoVariantsJob).toBeCalledTimes(1);
        expect(mockDefaultProductMapper.mapCtProductVariantsToKlaviyoVariantsJob).toBeCalledWith(
            mockProduct,
            [mockVariant, mockVariant],
            'variantUpdated',
        );
        expect(mockKlaviyoSdkService.sendJobRequestToKlaviyo).toBeCalledTimes(2);
    });

    it('should send 1 item update and 1 variant delete request to klaviyo when CT returns 1 products with pagination', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();
        mockKlaviyoSdkService.sendJobRequestToKlaviyo.mockResolvedValueOnce({
            body: {
                data: {
                    attributes: {
                        completed_count: 1,
                        failed_count: 0,
                    },
                },
            },
        });
        mockKlaviyoSdkService.getKlaviyoItemsByIds.mockResolvedValueOnce([
            {
                id: '$custom:::$default:::test-id',
            } as any,
        ]);
        mockKlaviyoSdkService.getKlaviyoItemVariantsByCtSkus.mockResolvedValueOnce([
            {
                id: '$custom:::$default:::test-id',
            } as any,
        ]);

        const mockProduct = mock<Product>();
        const mockVariant = mock<ProductVariant>();
        Object.defineProperty(mockProduct, 'id', { value: 'test-id' });
        Object.defineProperty(mockVariant, 'sku', { value: 'test-id' });
        Object.defineProperty(mockProduct, 'masterData', {
            value: {
                current: {
                    masterVariant: {},
                    variants: [],
                },
            },
        });
        mockDefaultCtProductService.getAllProducts.mockResolvedValueOnce({ data: [mockProduct], hasMore: false });

        await historicalProducts.syncAllProducts();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtProductService.getAllProducts).toBeCalledTimes(1);
        expect(mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob).toBeCalledTimes(1);
        expect(mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob).toBeCalledWith([mockProduct], 'itemUpdated');
        expect(mockDefaultProductMapper.mapCtProductVariantsToKlaviyoVariantsJob).toBeCalledTimes(2);
        expect(mockDefaultProductMapper.mapCtProductVariantsToKlaviyoVariantsJob).toBeCalledWith(
            mockProduct,
            ['$custom:::$default:::test-id'],
            'variantDeleted',
        );
        expect(mockKlaviyoSdkService.sendJobRequestToKlaviyo).toBeCalledTimes(3);
    });

    it('should not allow to run the product sync if there is another sync in progress', async () => {
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(409, 'is locked', ErrorCodes.LOCKED);
        });

        await historicalProducts.syncAllProducts();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(0);
        expect(mockDefaultCtProductService.getAllProducts).toBeCalledTimes(0);
        expect(mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendJobRequestToKlaviyo).toBeCalledTimes(0);
    });

    it('should log errors and release lock if an unhandled error is thrown during processing', async () => {
        const errorSpy = jest.spyOn(logger, 'error');
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(500, 'Unknown error', ErrorCodes.UNKNOWN_ERROR);
        });

        await historicalProducts.syncAllProducts();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtProductService.getAllProducts).toBeCalledTimes(0);
        expect(mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendJobRequestToKlaviyo).toBeCalledTimes(0);
        expect(errorSpy).toBeCalledTimes(1);
    });
});

describe('deleteAllProducts', () => {
    it('should delete a single item in klaviyo when Klaviyo returns a single item', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockProduct = {
            id: 'test',
        } as any;
        mockKlaviyoSdkService.getKlaviyoPaginatedItems.mockResolvedValueOnce({
            data: [mockProduct],
            links: { next: undefined } as any,
        });

        await historicalProducts.deleteAllProducts();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockKlaviyoSdkService.getKlaviyoPaginatedItems).toBeCalledTimes(1);
        expect(mockDefaultProductMapper.mapKlaviyoItemIdToDeleteItemRequest).toBeCalledTimes(1);
        expect(mockDefaultProductMapper.mapKlaviyoItemIdToDeleteItemRequest).toBeCalledWith(mockProduct.id);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(1);
    });

    it('should delete 10 items from klaviyo when klaviyo returns 10 items with pagination', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockProduct = {
            id: 'test',
        } as any;
        mockKlaviyoSdkService.getKlaviyoPaginatedItems.mockResolvedValueOnce({
            data: Array(6).fill(mockProduct),
            links: { next: 'next-page' } as any,
        });
        mockKlaviyoSdkService.getKlaviyoPaginatedItems.mockResolvedValueOnce({
            data: Array(4).fill(mockProduct),
            links: { next: undefined } as any,
        });

        await historicalProducts.deleteAllProducts();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockKlaviyoSdkService.getKlaviyoPaginatedItems).toBeCalledTimes(2);
        expect(mockDefaultProductMapper.mapKlaviyoItemIdToDeleteItemRequest).toBeCalledTimes(10);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(10);
    });

    it('should not allow to run the product sync if there is another sync in progress', async () => {
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(409, 'is locked', ErrorCodes.LOCKED);
        });

        await historicalProducts.deleteAllProducts();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.getKlaviyoPaginatedItems).toBeCalledTimes(0);
        expect(mockDefaultProductMapper.mapKlaviyoItemIdToDeleteItemRequest).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
    });

    it('should log errors and release lock if an unhandled error is thrown during processing', async () => {
        const errorSpy = jest.spyOn(logger, 'error');
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(500, 'Unknown error', ErrorCodes.UNKNOWN_ERROR);
        });

        await historicalProducts.deleteAllProducts();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockKlaviyoSdkService.getKlaviyoPaginatedItems).toBeCalledTimes(0);
        expect(mockDefaultProductMapper.mapKlaviyoItemIdToDeleteItemRequest).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
        expect(errorSpy).toBeCalledTimes(1);
    });
});
