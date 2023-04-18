import { DefaultCtOrderService } from './DefaultCtOrderService';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { Order } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { ByProjectKeyOrdersRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/orders/by-project-key-orders-request-builder';
import { ByProjectKeyOrdersByIDRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/orders/by-project-key-orders-by-id-request-builder';
import { ApiRequest } from '@commercetools/platform-sdk/dist/declarations/src/generated/shared/utils/requests-utils';
import { OrderPagedQueryResponse } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/order';
import { CTErrorResponse } from '../../../test/utils/CTErrorResponse';
import * as ctService from './ctService';

jest.mock('./ctService', () => {
    return {
        getApiRoot: jest.fn(),
    };
});

const mockCtApiRoot: DeepMockProxy<ByProjectKeyRequestBuilder> = mockDeep<ByProjectKeyRequestBuilder>();
const ordersMock: DeepMockProxy<ByProjectKeyOrdersRequestBuilder> = mockDeep<ByProjectKeyOrdersRequestBuilder>()

mockCtApiRoot.orders.mockImplementation(() => ordersMock)
const mockGetCustomObjectApiPagedRequest: DeepMockProxy<ApiRequest<OrderPagedQueryResponse>> = mockDeep<ApiRequest<OrderPagedQueryResponse>>();
const mockGetCustomObjectApiRequest: DeepMockProxy<ApiRequest<Order>> = mockDeep<ApiRequest<Order>>();
const ordersWithIdMock = mockDeep<ByProjectKeyOrdersByIDRequestBuilder>();
ordersMock.withId.mockImplementation(() => ordersWithIdMock);
ordersWithIdMock.get.mockImplementation(() => mockGetCustomObjectApiRequest);

ordersMock.get.mockImplementation(() => mockGetCustomObjectApiPagedRequest)


describe('getAllOrders', () => {
    it('should return a page orders from CT', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockResolvedValueOnce({ body: {
            limit: 0,
                count: 1,
                results: [mock<Order>()],
                offset: 0,
                total: 0
            }
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        const result = await ctOrderService.getAllOrders();

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
        expect(result.data.length).toEqual(1);
    });

    it('should throw an error if fails to get orders from CT APIs', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockImplementation(() => {throw new CTErrorResponse(504, "CT Error")});
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        await expect(ctOrderService.getAllOrders()).rejects.toThrow(Error)

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);

    });
});

describe('getOrdersByIdRange', () => {
    it('should return a page orders from CT', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockResolvedValueOnce({ body: {
            limit: 0,
                count: 1,
                results: [mock<Order>()],
                offset: 0,
                total: 0
            }
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        const result = await ctOrderService.getOrdersByIdRange(['123456']);

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
        expect(result.data.length).toEqual(1);
    });

    it('should throw an error if fails to get orders from CT APIs', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockImplementation(() => {throw new CTErrorResponse(504, "CT Error")});
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        await expect(ctOrderService.getOrdersByIdRange(['123456'])).rejects.toThrow(Error)

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);

    });
});

describe('getOrdersByStartId', () => {
    it('should return a page orders from CT', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockResolvedValueOnce({ body: {
            limit: 0,
                count: 1,
                results: [mock<Order>()],
                offset: 0,
                total: 0
            }
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        const result = await ctOrderService.getOrdersByStartId('123456');

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
        expect(result.data.length).toEqual(1);
    });

    it('should throw an error if fails to get orders from CT APIs', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockImplementation(() => {throw new CTErrorResponse(504, "CT Error")});
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        await expect(ctOrderService.getOrdersByIdRange(['123456'])).rejects.toThrow(Error)

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);

    });
});

describe('getOrderById', () => {
    it('should return an order from CT', async () => {
        mockGetCustomObjectApiRequest.execute.mockResolvedValueOnce({
            body: mock<Order>()
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot);
        await ctOrderService.getOrderById('123456');

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    });

    it('should return undefined if fails to get orders from CT APIs', async () => {
        mockGetCustomObjectApiRequest.execute.mockImplementation(() => {
            throw new CTErrorResponse(504, 'CT Error');
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot);
        expect(await ctOrderService.getOrderById('123456')).toBeUndefined();

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    });
});

describe('getOrderByPaymentId', () => {
    it('should return a page orders from CT', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockResolvedValueOnce({ body: {
            limit: 0,
                count: 1,
                results: [mock<Order>()],
                offset: 0,
                total: 0
            }
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        const result = await ctOrderService.getOrderByPaymentId('123456');

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);
        expect(result).toBeDefined();
    });

    it('should throw an error if no orders are found with this payment id', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockResolvedValueOnce({ body: {
            limit: 0,
                count: 0,
                results: [],
                offset: 0,
                total: 0
            }
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        await expect(ctOrderService.getOrderByPaymentId('123456')).rejects.toThrow(Error)

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);

    });

    it('should throw an error if fails to get orders from CT APIs', async () => {
        mockGetCustomObjectApiPagedRequest.execute.mockImplementation(() => {throw new CTErrorResponse(504, "CT Error")});
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        await expect(ctOrderService.getOrderByPaymentId('123456')).rejects.toThrow(Error)

        expect(mockGetCustomObjectApiPagedRequest.execute).toBeCalledTimes(1);

    });
});
