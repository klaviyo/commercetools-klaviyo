import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { Product, ProductPagedQueryResponse } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { ByProjectKeyProductsRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/products/by-project-key-products-request-builder';
import { ByProjectKeyProductsByIDRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/products/by-project-key-products-by-id-request-builder';
import { ApiRequest } from '@commercetools/platform-sdk/dist/declarations/src/generated/shared/utils/requests-utils';
import { CTErrorResponse } from '../../../test/utils/CTErrorResponse';
import { DefaultCtProductService } from './DefaultCtProductService';

jest.mock('./ctService', () => {
    return {
        getApiRoot: jest.fn(),
    };
});

const mockCtApiRoot: DeepMockProxy<ByProjectKeyRequestBuilder> = mockDeep<ByProjectKeyRequestBuilder>();
const productsMock: DeepMockProxy<ByProjectKeyProductsRequestBuilder> =
    mockDeep<ByProjectKeyProductsRequestBuilder>();

mockCtApiRoot.products.mockImplementation(() => productsMock);
const mockGetCustomObjectApiRequest = mockDeep<ApiRequest<Product>>();
const productsWithIdMock = mockDeep<ByProjectKeyProductsByIDRequestBuilder>();
productsMock.withId.mockImplementation(() => productsWithIdMock);
productsWithIdMock.get.mockImplementation(() => mockGetCustomObjectApiRequest);
const mockGetCustomObjectApiPagedRequest = mockDeep<ApiRequest<ProductPagedQueryResponse>>();
productsMock.get.mockImplementation(() => mockGetCustomObjectApiPagedRequest);

describe('getAllProducts', () => {
    it('should return a page of products from CT', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockResolvedValueOnce({
            body: {
                limit: 0,
                count: 1,
                results: [mock<Product>()],
                offset: 0,
                total: 0,
            },
        });

        const ctProductService = new DefaultCtProductService(mockCtApiRoot);
        const result = await ctProductService.getAllProducts();

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
        expect(result.data.length).toEqual(1);
    });

    it('should throw an error if fails to get products from CT APIs', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockImplementation(() => {
            throw new CTErrorResponse(504, 'CT Error');
        });

        const ctProductService = new DefaultCtProductService(mockCtApiRoot);
        await expect(ctProductService.getAllProducts()).rejects.toThrow(Error);

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
    });
});
