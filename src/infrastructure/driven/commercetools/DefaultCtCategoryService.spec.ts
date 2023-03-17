import { DefaultCtCustomerService } from './DefaultCtCustomerService';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { Category, Customer } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { ByProjectKeyCategoriesRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/categories/by-project-key-categories-request-builder';
import { ByProjectKeyCategoriesByIDRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/categories/by-project-key-categories-by-id-request-builder';
import { ApiRequest } from '@commercetools/platform-sdk/dist/declarations/src/generated/shared/utils/requests-utils';
import { CustomerPagedQueryResponse } from '@commercetools/platform-sdk';
import { CTErrorResponse } from '../../../test/utils/CTErrorResponse';
import { DefaultCtCategoryService } from './DefaultCategoryService';

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

describe('getCategoryById', () => {
    it('should return a page of customers from CT', async () => {
        mockGetCustomObjectApiRequest.execute.mockResolvedValueOnce({
            body: mock<Category>()
        });

        const ctCategoryService = new DefaultCtCategoryService(mockCtApiRoot);
        const result = await ctCategoryService.getCategoryById('123456');

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
        // expect(result.data.length).toEqual(1);
    });

    it('should throw an error if fails to get customers from CT APIs', async () => {
        mockGetCustomObjectApiRequest.execute.mockImplementation(() => {
            throw new CTErrorResponse(504, 'CT Error');
        });

        const ctCategoryService = new DefaultCtCategoryService(mockCtApiRoot);
        await expect(ctCategoryService.getCategoryById('123456')).rejects.toThrow(Error);

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    });
});
