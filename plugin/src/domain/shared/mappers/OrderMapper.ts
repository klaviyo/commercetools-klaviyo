import { LineItem, Order, Product } from '@commercetools/platform-sdk';
import { EventRequest } from '../../../types/klaviyo-types';

export interface OrderMapper {
    mapCtOrderToKlaviyoEvent(
        order: Order,
        orderProducts: Product[],
        metric: string,
        updateAdditionalProfileProperties: boolean,
        time?: string,
        klaviyoProfileId?: string,
    ): EventRequest;
    mapCtRefundedOrderToKlaviyoEvent(
        order: Order,
        orderProducts: Product[],
        metric: string,
        time?: string,
        klaviyoProfileId?: string,
    ): EventRequest;
    mapOrderLineToProductOrderedEvent(
        lineItem: LineItem,
        order: Order,
        time?: string,
        klaviyoProfileId?: string,
    ): EventRequest;
}
