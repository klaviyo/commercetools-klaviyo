import { DefaultCtOrderService } from './DefaultCtOrderService';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { Order } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { ByProjectKeyOrdersRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/orders/by-project-key-orders-request-builder';
import { ApiRequest } from '@commercetools/platform-sdk/dist/declarations/src/generated/shared/utils/requests-utils';
import { OrderPagedQueryResponse } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/order';
import { CTErrorResponse } from '../../../test/utils/CTErrorResponse';

jest.mock('./ctService', () => {
    return {
        getApiRoot: jest.fn(),
    };
});

const mockCtApiRoot: DeepMockProxy<ByProjectKeyRequestBuilder> = mockDeep<ByProjectKeyRequestBuilder>();
const ordersMock: DeepMockProxy<ByProjectKeyOrdersRequestBuilder> = mockDeep<ByProjectKeyOrdersRequestBuilder>()

mockCtApiRoot.orders.mockImplementation(() => ordersMock)
const mockGetCustomObjectApiRequest: DeepMockProxy<ApiRequest<OrderPagedQueryResponse>> = mockDeep<ApiRequest<OrderPagedQueryResponse>>();

ordersMock.get.mockImplementation(() => mockGetCustomObjectApiRequest)


describe('getAllOrders', () => {

    it('should return a page orders from CT', async () => {
        mockGetCustomObjectApiRequest.execute.mockResolvedValueOnce({ body: {
            limit: 0,
                count: 1,
                results: [mock<Order>()],
                offset: 0,
                total: 0
            }
        })

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        const result = await ctOrderService.getAllOrders();

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
        expect(result.data.length).toEqual(1);
    });

    it('should throw an error if fails to get orders from CT APIs', async () => {
        mockGetCustomObjectApiRequest.execute.mockImplementation(() => {throw new CTErrorResponse(504, "CT Error")})

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        await expect(ctOrderService.getAllOrders()).rejects.toThrow(Error)

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);

    });
});

describe('getOrdersByIdRange', () => {

    it('should return a page orders from CT', async () => {
        mockGetCustomObjectApiRequest.execute.mockResolvedValueOnce({ body: {
            limit: 0,
                count: 1,
                results: [mock<Order>()],
                offset: 0,
                total: 0
            }
        })

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        const result = await ctOrderService.getOrdersByIdRange(['123456']);

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
        expect(result.data.length).toEqual(1);
    });

    it('should throw an error if fails to get orders from CT APIs', async () => {
        mockGetCustomObjectApiRequest.execute.mockImplementation(() => {throw new CTErrorResponse(504, "CT Error")})

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        await expect(ctOrderService.getOrdersByIdRange(['123456'])).rejects.toThrow(Error)

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);

    });
});

describe('getOrdersByStartId', () => {

    it('should return a page orders from CT', async () => {
        mockGetCustomObjectApiRequest.execute.mockResolvedValueOnce({ body: {
            limit: 0,
                count: 1,
                results: [mock<Order>()],
                offset: 0,
                total: 0
            }
        })

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        const result = await ctOrderService.getOrdersByStartId('123456');

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
        expect(result.data.length).toEqual(1);
    });

    it('should throw an error if fails to get orders from CT APIs', async () => {
        mockGetCustomObjectApiRequest.execute.mockImplementation(() => {throw new CTErrorResponse(504, "CT Error")})

        const ctOrderService = new DefaultCtOrderService(mockCtApiRoot)
        await expect(ctOrderService.getOrdersByIdRange(['123456'])).rejects.toThrow(Error)

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);

    });
});
