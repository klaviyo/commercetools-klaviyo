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
    it('should create a single product in klaviyo when CT returns a single product', async () => {
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

        const mockProduct = mock<Product>();
        Object.defineProperty(mockProduct, 'masterData', {
            value: {
                current: {
                    variants: [],
                },
            },
        });
        Object.defineProperty(mockProduct, 'id', { value: 'test-id' });
        mockDefaultCtProductService.getAllProducts.mockResolvedValueOnce({ data: [mockProduct], hasMore: false });

        await historicalProducts.syncAllProducts();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtProductService.getAllProducts).toBeCalledTimes(1);
        expect(mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob).toBeCalledTimes(1);
        expect(mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob).toBeCalledWith([mockProduct], "itemCreated");
        expect(mockKlaviyoSdkService.sendJobRequestToKlaviyo).toBeCalledTimes(1);
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
        mockKlaviyoSdkService.getKlaviyoVariantsByCtSkus.mockResolvedValueOnce([]);

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
        expect(mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob).toBeCalledWith([mockProduct], 'itemCreated');
        expect(mockDefaultProductMapper.mapCtProductVariantsToKlaviyoVariantsJob).toBeCalledTimes(1);
        expect(mockDefaultProductMapper.mapCtProductVariantsToKlaviyoVariantsJob).toBeCalledWith(mockProduct, [mockVariant], 'variantCreated');
        expect(mockKlaviyoSdkService.sendJobRequestToKlaviyo).toBeCalledTimes(2);
    });

    it('should send 1 item creation request to klaviyo when CT returns 10 products with pagination', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();
        mockKlaviyoSdkService.getKlaviyoItemsByIds.mockResolvedValueOnce([]);
        mockKlaviyoSdkService.getKlaviyoVariantsByCtSkus.mockResolvedValueOnce([]);

        const mockProduct = mock<Product>();
        Object.defineProperty(mockProduct, 'masterData', {
            value: {
                current: {
                    variants: [],
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
        expect(mockDefaultProductMapper.mapCtProductsToKlaviyoItemJob).toBeCalledTimes(1);
        expect(mockKlaviyoSdkService.sendJobRequestToKlaviyo).toBeCalledTimes(1);
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
        mockKlaviyoSdkService.getKlaviyoVariantsByCtSkus.mockResolvedValueOnce([
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
        expect(mockDefaultProductMapper.mapCtProductVariantsToKlaviyoVariantsJob).toBeCalledWith(mockProduct, [mockVariant], 'variantUpdated');
        expect(mockKlaviyoSdkService.sendJobRequestToKlaviyo).toBeCalledTimes(2);
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
