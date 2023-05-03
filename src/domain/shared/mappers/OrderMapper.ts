import { LineItem, Order, Product } from '@commercetools/platform-sdk';

export interface OrderMapper {
    mapCtOrderToKlaviyoEvent(order: Order, orderProducts: Product[],metric: string, time?: string): EventRequest;
    mapCtRefundedOrderToKlaviyoEvent(order: Order, orderProducts: Product[], metric: string, time?: string): EventRequest;
    mapOrderLineToProductOrderedEvent(lineItem: LineItem, order: Order, time?: string): EventRequest;
}
