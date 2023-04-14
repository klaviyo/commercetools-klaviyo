import { LineItem, Order } from '@commercetools/platform-sdk';

export interface OrderMapper {
    mapCtOrderToKlaviyoEvent(order: Order, metric: string, time?: string): EventRequest;
    mapCtRefundedOrderToKlaviyoEvent(order: Order, metric: string, time?: string): EventRequest;
    mapOrderLineToProductOrderedEvent(lineItem: LineItem, order: Order, time?: string): EventRequest;
}
