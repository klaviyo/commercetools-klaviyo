import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { Category, CategoryPagedQueryResponse } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { ByProjectKeyCategoriesRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/categories/by-project-key-categories-request-builder';
import { ByProjectKeyCategoriesByIDRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/categories/by-project-key-categories-by-id-request-builder';
import { ApiRequest } from '@commercetools/platform-sdk/dist/declarations/src/generated/shared/utils/requests-utils';
import { CTErrorResponse } from '../../../test/utils/CTErrorResponse';
import { DefaultCtCategoryService } from './DefaultCtCategoryService';
import * as ctService from './ctService';

jest.mock('./ctService', () => {
    return {
        getApiRoot: jest.fn(),
    };
});

const mockCtApiRoot: DeepMockProxy<ByProjectKeyRequestBuilder> = mockDeep<ByProjectKeyRequestBuilder>();
const categoriesMock: DeepMockProxy<ByProjectKeyCategoriesRequestBuilder> =
    mockDeep<ByProjectKeyCategoriesRequestBuilder>();

mockCtApiRoot.categories.mockImplementation(() => categoriesMock);
const mockGetCustomObjectApiRequest = mockDeep<ApiRequest<Category>>();
const categoriesWithIdMock = mockDeep<ByProjectKeyCategoriesByIDRequestBuilder>();
categoriesMock.withId.mockImplementation(() => categoriesWithIdMock);
categoriesWithIdMock.get.mockImplementation(() => mockGetCustomObjectApiRequest);
const mockGetCustomObjectApiPagedRequest = mockDeep<ApiRequest<CategoryPagedQueryResponse>>();
categoriesMock.get.mockImplementation(() => mockGetCustomObjectApiPagedRequest);

describe('getAllCategories', () => {
    it('should return a page of categories from CT', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockResolvedValueOnce({
            body: {
                limit: 0,
                count: 1,
                results: [mock<Category>()],
                offset: 0,
                total: 0,
            },
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctCategoryService = new DefaultCtCategoryService(mockCtApiRoot);
        const result = await ctCategoryService.getAllCategories();

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
        expect(result.data.length).toEqual(1);
    });

    it('should start from a given id when lastId is provided', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockResolvedValueOnce({
            body: {
                limit: 0,
                count: 1,
                results: [mock<Category>()],
                offset: 0,
                total: 0,
            },
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctCategoryService = new DefaultCtCategoryService(mockCtApiRoot);
        const result = await ctCategoryService.getAllCategories('123456');

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
        expect(result.data.length).toEqual(1);
    });

    it('should not set lastId if there are no more results', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockResolvedValueOnce({
            body: {
                limit: 0,
                count: 1,
                results: [],
                offset: 0,
                total: 0,
            },
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctCategoryService = new DefaultCtCategoryService(mockCtApiRoot);
        const result = await ctCategoryService.getAllCategories('123456');

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
        expect(result.data.length).toEqual(0);
        expect(result.lastId).toBeUndefined();
    });

    it('should throw an error if fails to get categories from CT APIs', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockImplementation(() => {
            throw new CTErrorResponse(504, 'CT Error');
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctCategoryService = new DefaultCtCategoryService(mockCtApiRoot);
        await expect(ctCategoryService.getAllCategories()).rejects.toThrow(Error);

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
    });
});

describe('getCategoryById', () => {
    it('should return a category from CT', async () => {
        mockGetCustomObjectApiRequest.execute.mockResolvedValueOnce({
            body: mock<Category>()
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctCategoryService = new DefaultCtCategoryService(mockCtApiRoot);
        await ctCategoryService.getCategoryById('123456');

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    });

    it('should throw an error if fails to get categories from CT APIs', async () => {
        mockGetCustomObjectApiRequest.execute.mockImplementation(() => {
            throw new CTErrorResponse(504, 'CT Error');
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctCategoryService = new DefaultCtCategoryService(mockCtApiRoot);
        await expect(ctCategoryService.getCategoryById('123456')).rejects.toThrow(Error);

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    });
});
