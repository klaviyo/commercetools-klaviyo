import { CategoriesSync } from './CategoriesSync';
import { KlaviyoSdkService } from '../../infrastructure/driven/klaviyo/KlaviyoSdkService';
import { CTCustomObjectLockService } from './services/CTCustomObjectLockService';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { Category } from '@commercetools/platform-sdk';
import { ErrorCodes, StatusError } from '../../types/errors/StatusError';
import { DefaultCtCategoryService } from '../../infrastructure/driven/commercetools/DefaultCtCategoryService';
import { DefaultCategoryMapper } from '../shared/mappers/DefaultCategoryMapper';
import logger from '../../utils/log';

const mockCtCustomObjectLockService: DeepMockProxy<CTCustomObjectLockService> = mockDeep<CTCustomObjectLockService>();
const mockDefaultCategoryMapper: DeepMockProxy<DefaultCategoryMapper> = mockDeep<DefaultCategoryMapper>();
const mockKlaviyoSdkService: DeepMockProxy<KlaviyoSdkService> = mockDeep<KlaviyoSdkService>();
const mockDefaultCtCategoryService: DeepMockProxy<DefaultCtCategoryService> = mockDeep<DefaultCtCategoryService>();

const historicalCategories = new CategoriesSync(
    mockCtCustomObjectLockService,
    mockDefaultCategoryMapper,
    mockKlaviyoSdkService,
    mockDefaultCtCategoryService,
);

describe('syncAllCategories', () => {
    it('should create a single category in klaviyo when CT returns a single category', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockCategory = mock<Category>();
        Object.defineProperty(mockCategory, 'createdAt', { value: '2023-01-27T15:00:00.000Z' });
        mockDefaultCtCategoryService.getAllCategories.mockResolvedValueOnce({ data: [mockCategory], hasMore: false });

        await historicalCategories.syncAllCategories();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtCategoryService.getAllCategories).toBeCalledTimes(1);
        expect(mockDefaultCategoryMapper.mapCtCategoryToKlaviyoCategory).toBeCalledTimes(1);
        expect(mockDefaultCategoryMapper.mapCtCategoryToKlaviyoCategory).toBeCalledWith(mockCategory);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(1);
    });

    it('should send 10 categories to klaviyo when CT returns 10 categories with pagination', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockCategory = mock<Category>();
        mockDefaultCtCategoryService.getAllCategories.mockResolvedValueOnce({
            data: Array(6).fill(mockCategory),
            hasMore: true,
        });
        mockDefaultCtCategoryService.getAllCategories.mockResolvedValueOnce({
            data: Array(4).fill(mockCategory),
            hasMore: false,
        });

        await historicalCategories.syncAllCategories();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtCategoryService.getAllCategories).toBeCalledTimes(2);
        expect(mockDefaultCategoryMapper.mapCtCategoryToKlaviyoCategory).toBeCalledTimes(10);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(10);
    });

    it('should not allow to run the category sync if there is another sync in progress', async () => {
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(409, 'is locked', ErrorCodes.LOCKED);
        });

        await historicalCategories.syncAllCategories();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(0);
        expect(mockDefaultCtCategoryService.getAllCategories).toBeCalledTimes(0);
        expect(mockDefaultCategoryMapper.mapCtCategoryToKlaviyoCategory).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
    });

    it('should log errors and release lock if an unhandled error is thrown during processing', async () => {
        const errorSpy = jest.spyOn(logger, 'error');
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(500, 'Unknown error', ErrorCodes.UNKNOWN_ERROR);
        });

        await historicalCategories.syncAllCategories();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtCategoryService.getAllCategories).toBeCalledTimes(0);
        expect(mockDefaultCategoryMapper.mapCtCategoryToKlaviyoCategory).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
        expect(errorSpy).toBeCalledTimes(1);
    });
});

describe('deleteAllCategories', () => {
    it('should delete a single category in klaviyo when Klaviyo returns a single category', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockCategory = {
            id: 'test',
        } as any;
        mockKlaviyoSdkService.getKlaviyoPaginatedCategories.mockResolvedValueOnce({
            data: [mockCategory],
            links: { next: undefined } as any,
        });

        await historicalCategories.deleteAllCategories();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockKlaviyoSdkService.getKlaviyoPaginatedCategories).toBeCalledTimes(1);
        expect(mockDefaultCategoryMapper.mapKlaviyoCategoryIdToDeleteCategoryRequest).toBeCalledTimes(1);
        expect(mockDefaultCategoryMapper.mapKlaviyoCategoryIdToDeleteCategoryRequest).toBeCalledWith(mockCategory.id);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(1);
    });

    it('should delete 10 categories from klaviyo when klaviyo returns 10 categories with pagination', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockCategory = {
            id: 'test',
        } as any;
        mockKlaviyoSdkService.getKlaviyoPaginatedCategories.mockResolvedValueOnce({
            data: Array(6).fill(mockCategory),
            links: { next: 'next-page' } as any,
        });
        mockKlaviyoSdkService.getKlaviyoPaginatedCategories.mockResolvedValueOnce({
            data: Array(4).fill(mockCategory),
            links: { next: undefined } as any,
        });

        await historicalCategories.deleteAllCategories();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockKlaviyoSdkService.getKlaviyoPaginatedCategories).toBeCalledTimes(2);
        expect(mockDefaultCategoryMapper.mapKlaviyoCategoryIdToDeleteCategoryRequest).toBeCalledTimes(10);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(10);
    });

    it('should not allow to run the category sync if there is another sync in progress', async () => {
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(409, 'is locked', ErrorCodes.LOCKED);
        });

        await historicalCategories.deleteAllCategories();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.getKlaviyoPaginatedCategories).toBeCalledTimes(0);
        expect(mockDefaultCategoryMapper.mapKlaviyoCategoryIdToDeleteCategoryRequest).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
    });

    it('should log errors and release lock if an unhandled error is thrown during processing', async () => {
        const errorSpy = jest.spyOn(logger, 'error');
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(500, 'Unknown error', ErrorCodes.UNKNOWN_ERROR);
        });

        await historicalCategories.deleteAllCategories();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockKlaviyoSdkService.getKlaviyoPaginatedCategories).toBeCalledTimes(0);
        expect(mockDefaultCategoryMapper.mapKlaviyoCategoryIdToDeleteCategoryRequest).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
        expect(errorSpy).toBeCalledTimes(1);
    });
});
