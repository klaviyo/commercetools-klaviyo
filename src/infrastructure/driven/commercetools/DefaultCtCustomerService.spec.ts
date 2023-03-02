import { DefaultCtCustomerService } from './DefaultCtCustomerService';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { Customer } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { ByProjectKeyCustomersRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/customers/by-project-key-customers-request-builder';
import { ApiRequest } from '@commercetools/platform-sdk/dist/declarations/src/generated/shared/utils/requests-utils';
import { CustomerPagedQueryResponse } from '@commercetools/platform-sdk';
import { CTErrorResponse } from '../../../test/utils/CTErrorResponse';

jest.mock('./ctService', () => {
    return {
        getApiRoot: jest.fn(),
    };
});

const mockCtApiRoot: DeepMockProxy<ByProjectKeyRequestBuilder> = mockDeep<ByProjectKeyRequestBuilder>();
const customersMock: DeepMockProxy<ByProjectKeyCustomersRequestBuilder> =
    mockDeep<ByProjectKeyCustomersRequestBuilder>();

mockCtApiRoot.customers.mockImplementation(() => customersMock);
const mockGetCustomObjectApiRequest: DeepMockProxy<ApiRequest<CustomerPagedQueryResponse>> =
    mockDeep<ApiRequest<CustomerPagedQueryResponse>>();

customersMock.get.mockImplementation(() => mockGetCustomObjectApiRequest);

describe('getAllCustomers', () => {
    it('should return a page of customers from CT', async () => {
        mockGetCustomObjectApiRequest.execute.mockResolvedValueOnce({
            body: {
                limit: 0,
                count: 1,
                results: [mock<Customer>()],
                offset: 0,
                total: 0,
            },
        });

        const ctCustomerService = new DefaultCtCustomerService(mockCtApiRoot);
        const result = await ctCustomerService.getAllCustomers();

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
        expect(result.data.length).toEqual(1);
    });

    it('should throw an error if fails to get customers from CT APIs', async () => {
        mockGetCustomObjectApiRequest.execute.mockImplementation(() => {
            throw new CTErrorResponse(504, 'CT Error');
        });

        const ctCustomerService = new DefaultCtCustomerService(mockCtApiRoot);
        await expect(ctCustomerService.getAllCustomers()).rejects.toThrow(Error);

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    });
});
