import { DefaultCtCustomerService } from './DefaultCtCustomerService';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { Customer } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { ByProjectKeyCustomersRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/customers/by-project-key-customers-request-builder';
import { ByProjectKeyCustomersByIDRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/customers/by-project-key-customers-by-id-request-builder';
import { ApiRequest } from '@commercetools/platform-sdk/dist/declarations/src/generated/shared/utils/requests-utils';
import { CustomerPagedQueryResponse } from '@commercetools/platform-sdk';
import { CTErrorResponse } from '../../../test/utils/CTErrorResponse';
import * as ctService from './ctService';

jest.mock('./ctService', () => {
    return {
        getApiRoot: jest.fn(),
    };
});

const mockCtApiRoot: DeepMockProxy<ByProjectKeyRequestBuilder> = mockDeep<ByProjectKeyRequestBuilder>();
const customersMock: DeepMockProxy<ByProjectKeyCustomersRequestBuilder> = mockDeep<ByProjectKeyCustomersRequestBuilder>()

mockCtApiRoot.customers.mockImplementation(() => customersMock)
const mockGetCustomObjectApiPagedRequest: DeepMockProxy<ApiRequest<CustomerPagedQueryResponse>> = mockDeep<ApiRequest<CustomerPagedQueryResponse>>();
const mockGetCustomObjectApiRequest: DeepMockProxy<ApiRequest<Customer>> = mockDeep<ApiRequest<Customer>>();
const customersWithIdMock = mockDeep<ByProjectKeyCustomersByIDRequestBuilder>();
customersMock.withId.mockImplementation(() => customersWithIdMock);
customersWithIdMock.get.mockImplementation(() => mockGetCustomObjectApiRequest);

customersMock.get.mockImplementation(() => mockGetCustomObjectApiPagedRequest)

describe('getAllCustomers', () => {
    it('should return a page of customers from CT', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockResolvedValueOnce({
            body: {
                limit: 0,
                count: 1,
                results: [mock<Customer>()],
                offset: 0,
                total: 0,
            },
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctCustomerService = new DefaultCtCustomerService(mockCtApiRoot);
        const result = await ctCustomerService.getAllCustomers();

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
        expect(result.data.length).toEqual(1);
    });

    it('should throw an error if fails to get customers from CT APIs', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockImplementation(() => {
            throw new CTErrorResponse(504, 'CT Error');
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctCustomerService = new DefaultCtCustomerService(mockCtApiRoot);
        await expect(ctCustomerService.getAllCustomers()).rejects.toThrow(Error);

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
    });
});

describe('getCustomersByIdRange', () => {
    it('should return a page of customers from CT', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockResolvedValueOnce({
            body: {
                limit: 0,
                count: 1,
                results: [mock<Customer>()],
                offset: 0,
                total: 0,
            },
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctCustomerService = new DefaultCtCustomerService(mockCtApiRoot);
        const result = await ctCustomerService.getCustomersByIdRange(['123456']);

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
        expect(result.data.length).toEqual(1);
    });

    it('should throw an error if fails to get customers from CT APIs', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockImplementation(() => {
            throw new CTErrorResponse(504, 'CT Error');
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctCustomerService = new DefaultCtCustomerService(mockCtApiRoot);
        await expect(ctCustomerService.getCustomersByIdRange(['123456'])).rejects.toThrow(Error);

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
    });
});

describe('getCustomerById', () => {
    it('should return an customer from CT', async () => {
        mockGetCustomObjectApiRequest.execute.mockResolvedValueOnce({
            body: mock<Customer>()
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctCustomerService = new DefaultCtCustomerService(mockCtApiRoot);
        await ctCustomerService.getCustomerProfile('123456');

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    });

    it('should return undefined if fails to get customers from CT APIs', async () => {
        mockGetCustomObjectApiRequest.execute.mockImplementation(() => {
            throw new CTErrorResponse(504, 'CT Error');
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctCustomerService = new DefaultCtCustomerService(mockCtApiRoot);
        await expect(ctCustomerService.getCustomerProfile('123456')).rejects.toThrow(Error)

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    });
});
