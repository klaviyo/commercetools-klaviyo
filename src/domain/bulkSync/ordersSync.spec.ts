import { OrdersSync } from "./OrdersSync";
import { DefaultOrderMapper } from "../shared/mappers/DefaultOrderMapper";
import { KlaviyoSdkService } from "../../infrastructure/driven/klaviyo/KlaviyoSdkService";
import { CTCustomObjectLockService } from "./services/CTCustomObjectLockService";
import { DeepMockProxy, mock, mockDeep } from "jest-mock-extended";
import { DefaultCtOrderService } from "../../infrastructure/driven/commercetools/DefaultCtOrderService";
import { LineItem, Order } from "@commercetools/platform-sdk";
import { ErrorCodes, StatusError } from "../../types/errors/StatusError";
import logger from '../../utils/log'

const mockCtCustomObjectLockService: DeepMockProxy<CTCustomObjectLockService> = mockDeep<CTCustomObjectLockService>();
const mockDefaultOrderMapper: DeepMockProxy<DefaultOrderMapper> = mockDeep<DefaultOrderMapper>();
const mockKlaviyoSdkService: DeepMockProxy<KlaviyoSdkService> = mockDeep<KlaviyoSdkService>();
const mockDefaultCtOrderService: DeepMockProxy<DefaultCtOrderService> = mockDeep<DefaultCtOrderService>();

const historicalOrders = new OrdersSync(
  mockCtCustomObjectLockService,
  mockDefaultOrderMapper,
  mockKlaviyoSdkService,
  mockDefaultCtOrderService,
);

describe('syncAllOrders', () => {
    it('should send a Place Order and Ordered Product events to klaviyo when CT returns a single order', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockOrder = mock<Order>();
        Object.defineProperty(mockOrder, 'createdAt', { value: "2023-01-27T15:00:00.000Z" });
        const mockOrderLineItems = mock<LineItem>();
        Object.defineProperty(mockOrder, 'lineItems', { value: [mockOrderLineItems] });
        mockDefaultCtOrderService.getAllOrders.mockResolvedValueOnce({data: [mockOrder], hasMore: false})

        await historicalOrders.syncAllOrders();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getAllOrders).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledWith(mockOrder, "Placed Order");
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledWith(mockOrderLineItems, mockOrder, "2023-01-27T15:00:01.000Z");
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(2);
    });

    it.each`
        ctOrderState 
        ${'Complete'}
        ${'Confirmed'}
    `('should send a Place Order and Ordered Product and Fulfilled Order events to klaviyo when CT returns a single order with status $ctOrderState', async ({ ctOrderState }) => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockOrder = mock<Order>();
        Object.defineProperty(mockOrder, 'createdAt', { value: "2023-01-27T15:00:00.000Z" });
        Object.defineProperty(mockOrder, 'orderState', { value: ctOrderState });
        const mockOrderLineItems = mock<LineItem>();
        Object.defineProperty(mockOrder, 'lineItems', { value: [mockOrderLineItems] });
        mockDefaultCtOrderService.getAllOrders.mockResolvedValueOnce({data: [mockOrder], hasMore: false})

        await historicalOrders.syncAllOrders();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getAllOrders).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(2);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(1, mockOrder, "Placed Order");
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(2, mockOrder, "Fulfilled Order", "2023-01-27T15:00:02.000Z");
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledWith(mockOrderLineItems, mockOrder, "2023-01-27T15:00:01.000Z");
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(3);
    });

    it('should send a Place Order and Ordered Product and Cancelled Order events to klaviyo when CT returns a single order with status Cancelled', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockOrder = mock<Order>();
        Object.defineProperty(mockOrder, 'createdAt', { value: "2023-01-27T15:00:00.000Z" });
        Object.defineProperty(mockOrder, 'orderState', { value: "Cancelled" });
        const mockOrderLineItems = mock<LineItem>();
        Object.defineProperty(mockOrder, 'lineItems', { value: [mockOrderLineItems] });
        mockDefaultCtOrderService.getAllOrders.mockResolvedValueOnce({data: [mockOrder], hasMore: false})

        await historicalOrders.syncAllOrders();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getAllOrders).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(2);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(1, mockOrder, "Placed Order");
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(2, mockOrder, "Cancelled Order", "2023-01-27T15:00:02.000Z");
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledWith(mockOrderLineItems, mockOrder, "2023-01-27T15:00:01.000Z");
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(3);

    });

    it('should send 20 events to klaviyo when CT returns 10 orders with 1 line each and orderStatus Open with pagination', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockOrder = mock<Order>();
        Object.defineProperty(mockOrder, 'createdAt', { value: "2023-01-27T15:00:00.000Z" });
        Object.defineProperty(mockOrder, 'orderState', { value: "Open" });
        const mockOrderLineItems = mock<LineItem>();
        Object.defineProperty(mockOrder, 'lineItems', { value: [mockOrderLineItems] });
        mockDefaultCtOrderService.getAllOrders.mockResolvedValueOnce({data: Array(6).fill(mockOrder), hasMore: true})
        mockDefaultCtOrderService.getAllOrders.mockResolvedValueOnce({data: Array(4).fill(mockOrder), hasMore: false})

        await historicalOrders.syncAllOrders();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getAllOrders).toBeCalledTimes(2);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(10);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(1, mockOrder, "Placed Order");
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(10);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledWith(mockOrderLineItems, mockOrder, "2023-01-27T15:00:01.000Z");
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(20);
    });

    it('should not allow to run the order sync if there is another sync in progress', async () => {
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(409, "is locked", ErrorCodes.LOCKED);
        });

        await historicalOrders.syncAllOrders();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(0);
        expect(mockDefaultCtOrderService.getAllOrders).toBeCalledTimes(0);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(0);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
    });

    it('should release the lock if the processing fails with any other exception that is not triggered by the lock service', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();
        const errorSpy = jest.spyOn(logger, 'error');
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(500, 'Unknown error', ErrorCodes.UNKNOWN_ERROR);
        });

        await historicalOrders.syncAllOrders();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getAllOrders).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(0);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
        expect(errorSpy).toBeCalledTimes(1);
    });
});

describe('syncOrdersByIdRange', () => {
    it('should send a Place Order and Ordered Product events to klaviyo when CT returns a single order', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockOrder = mock<Order>();
        Object.defineProperty(mockOrder, 'createdAt', { value: "2023-01-27T15:00:00.000Z" });
        const mockOrderLineItems = mock<LineItem>();
        Object.defineProperty(mockOrder, 'lineItems', { value: [mockOrderLineItems] });
        mockDefaultCtOrderService.getOrdersByIdRange.mockResolvedValueOnce({data: [mockOrder], hasMore: false})

        await historicalOrders.syncOrdersByIdRange(['123456']);

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getOrdersByIdRange).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledWith(mockOrder, "Placed Order");
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledWith(mockOrderLineItems, mockOrder, "2023-01-27T15:00:01.000Z");
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(2);
    });

    it.each`
        ctOrderState 
        ${'Complete'}
        ${'Confirmed'}
    `('should send a Place Order and Ordered Product and Fulfilled Order events to klaviyo when CT returns a single order with status $ctOrderState', async ({ ctOrderState }) => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockOrder = mock<Order>();
        Object.defineProperty(mockOrder, 'createdAt', { value: "2023-01-27T15:00:00.000Z" });
        Object.defineProperty(mockOrder, 'orderState', { value: ctOrderState });
        const mockOrderLineItems = mock<LineItem>();
        Object.defineProperty(mockOrder, 'lineItems', { value: [mockOrderLineItems] });
        mockDefaultCtOrderService.getOrdersByIdRange.mockResolvedValueOnce({data: [mockOrder], hasMore: false})

        await historicalOrders.syncOrdersByIdRange(['123456']);

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getOrdersByIdRange).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(2);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(1, mockOrder, "Placed Order");
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(2, mockOrder, "Fulfilled Order", "2023-01-27T15:00:02.000Z");
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledWith(mockOrderLineItems, mockOrder, "2023-01-27T15:00:01.000Z");
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(3);
    });

    it('should send a Place Order and Ordered Product and Cancelled Order events to klaviyo when CT returns a single order with status Cancelled', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockOrder = mock<Order>();
        Object.defineProperty(mockOrder, 'createdAt', { value: "2023-01-27T15:00:00.000Z" });
        Object.defineProperty(mockOrder, 'orderState', { value: "Cancelled" });
        const mockOrderLineItems = mock<LineItem>();
        Object.defineProperty(mockOrder, 'lineItems', { value: [mockOrderLineItems] });
        mockDefaultCtOrderService.getOrdersByIdRange.mockResolvedValueOnce({data: [mockOrder], hasMore: false})

        await historicalOrders.syncOrdersByIdRange(['123456']);

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getOrdersByIdRange).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(2);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(1, mockOrder, "Placed Order");
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(2, mockOrder, "Cancelled Order", "2023-01-27T15:00:02.000Z");
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledWith(mockOrderLineItems, mockOrder, "2023-01-27T15:00:01.000Z");
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(3);

    });

    it('should send 20 events to klaviyo when CT returns 10 orders with 1 line each and orderStatus Open with pagination', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockOrder = mock<Order>();
        Object.defineProperty(mockOrder, 'createdAt', { value: "2023-01-27T15:00:00.000Z" });
        Object.defineProperty(mockOrder, 'orderState', { value: "Open" });
        const mockOrderLineItems = mock<LineItem>();
        Object.defineProperty(mockOrder, 'lineItems', { value: [mockOrderLineItems] });
        mockDefaultCtOrderService.getOrdersByIdRange.mockResolvedValueOnce({data: Array(6).fill(mockOrder), hasMore: true})
        mockDefaultCtOrderService.getOrdersByIdRange.mockResolvedValueOnce({data: Array(4).fill(mockOrder), hasMore: false})

        await historicalOrders.syncOrdersByIdRange(Array(10).fill('123456'));

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getOrdersByIdRange).toBeCalledTimes(2);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(10);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(1, mockOrder, "Placed Order");
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(10);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledWith(mockOrderLineItems, mockOrder, "2023-01-27T15:00:01.000Z");
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(20);
    });

    it('should not allow to run the order sync if there is another sync in progress', async () => {
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(409, "is locked", ErrorCodes.LOCKED);
        });

        await historicalOrders.syncOrdersByIdRange(['123456']);

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(0);
        expect(mockDefaultCtOrderService.getOrdersByIdRange).toBeCalledTimes(0);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(0);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
    });

    it('should release the lock if the processing fails with any other exception that is not triggered by the lock service', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();
        const errorSpy = jest.spyOn(logger, 'error');
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(500, 'Unknown error', ErrorCodes.UNKNOWN_ERROR);
        });

        await historicalOrders.syncOrdersByIdRange(['123456']);

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getOrdersByIdRange).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(0);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
        expect(errorSpy).toBeCalledTimes(1);
    });
});

describe('syncOrdersByStartId', () => {
    it('should send a Place Order and Ordered Product events to klaviyo when CT returns a single order', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockOrder = mock<Order>();
        Object.defineProperty(mockOrder, 'createdAt', { value: "2023-01-27T15:00:00.000Z" });
        const mockOrderLineItems = mock<LineItem>();
        Object.defineProperty(mockOrder, 'lineItems', { value: [mockOrderLineItems] });
        mockDefaultCtOrderService.getOrdersByStartId.mockResolvedValueOnce({data: [mockOrder], hasMore: false})

        await historicalOrders.syncOrdersByStartId('123456');

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getOrdersByStartId).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledWith(mockOrder, "Placed Order");
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledWith(mockOrderLineItems, mockOrder, "2023-01-27T15:00:01.000Z");
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(2);
    });

    it.each`
        ctOrderState 
        ${'Complete'}
        ${'Confirmed'}
    `('should send a Place Order and Ordered Product and Fulfilled Order events to klaviyo when CT returns a single order with status $ctOrderState', async ({ ctOrderState }) => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockOrder = mock<Order>();
        Object.defineProperty(mockOrder, 'createdAt', { value: "2023-01-27T15:00:00.000Z" });
        Object.defineProperty(mockOrder, 'orderState', { value: ctOrderState });
        const mockOrderLineItems = mock<LineItem>();
        Object.defineProperty(mockOrder, 'lineItems', { value: [mockOrderLineItems] });
        mockDefaultCtOrderService.getOrdersByStartId.mockResolvedValueOnce({data: [mockOrder], hasMore: false})

        await historicalOrders.syncOrdersByStartId('123456');

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getOrdersByStartId).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(2);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(1, mockOrder, "Placed Order");
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(2, mockOrder, "Fulfilled Order", "2023-01-27T15:00:02.000Z");
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledWith(mockOrderLineItems, mockOrder, "2023-01-27T15:00:01.000Z");
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(3);
    });

    it('should send a Place Order and Ordered Product and Cancelled Order events to klaviyo when CT returns a single order with status Cancelled', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockOrder = mock<Order>();
        Object.defineProperty(mockOrder, 'createdAt', { value: "2023-01-27T15:00:00.000Z" });
        Object.defineProperty(mockOrder, 'orderState', { value: "Cancelled" });
        const mockOrderLineItems = mock<LineItem>();
        Object.defineProperty(mockOrder, 'lineItems', { value: [mockOrderLineItems] });
        mockDefaultCtOrderService.getOrdersByStartId.mockResolvedValueOnce({data: [mockOrder], hasMore: false})

        await historicalOrders.syncOrdersByStartId('123456');

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getOrdersByStartId).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(2);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(1, mockOrder, "Placed Order");
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(2, mockOrder, "Cancelled Order", "2023-01-27T15:00:02.000Z");
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledWith(mockOrderLineItems, mockOrder, "2023-01-27T15:00:01.000Z");
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(3);

    });

    it('should send 20 events to klaviyo when CT returns 10 orders with 1 line each and orderStatus Open with pagination', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockOrder = mock<Order>();
        Object.defineProperty(mockOrder, 'createdAt', { value: "2023-01-27T15:00:00.000Z" });
        Object.defineProperty(mockOrder, 'orderState', { value: "Open" });
        const mockOrderLineItems = mock<LineItem>();
        Object.defineProperty(mockOrder, 'lineItems', { value: [mockOrderLineItems] });
        mockDefaultCtOrderService.getOrdersByStartId.mockResolvedValueOnce({data: Array(6).fill(mockOrder), hasMore: true})
        mockDefaultCtOrderService.getOrdersByStartId.mockResolvedValueOnce({data: Array(4).fill(mockOrder), hasMore: false})

        await historicalOrders.syncOrdersByStartId('123456');

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getOrdersByStartId).toBeCalledTimes(2);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(10);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toHaveBeenNthCalledWith(1, mockOrder, "Placed Order");
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(10);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledWith(mockOrderLineItems, mockOrder, "2023-01-27T15:00:01.000Z");
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(20);
    });

    it('should not allow to run the order sync if there is another sync in progress', async () => {
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(409, "is locked", ErrorCodes.LOCKED);
        });

        await historicalOrders.syncOrdersByStartId('123456');

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(0);
        expect(mockDefaultCtOrderService.getOrdersByStartId).toBeCalledTimes(0);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(0);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
    });

    it('should release the lock if the processing fails with any other exception that is not triggered by the lock service', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();
        const errorSpy = jest.spyOn(logger, 'error');
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(500, 'Unknown error', ErrorCodes.UNKNOWN_ERROR);
        });

        await historicalOrders.syncOrdersByStartId('123456');

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtOrderService.getOrdersByStartId).toBeCalledTimes(1);
        expect(mockDefaultOrderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(0);
        expect(mockDefaultOrderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
        expect(errorSpy).toBeCalledTimes(1);
    });
});

