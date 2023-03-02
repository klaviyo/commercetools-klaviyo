import { getCustomerProfileFromOrder } from '../../../utils/get-customer-profile-from-order';
import { getTypedMoneyAsNumber } from '../../../utils/get-typed-money-as-number';
import { mapAllowedProperties } from '../../../utils/property-mapper';
import { LineItem, Order } from '@commercetools/platform-sdk';
import { OrderMapper } from './OrderMapper';
import config from 'config';
import { CurrencyService } from '../services/CurrencyService';

export class DefaultOrderMapper implements OrderMapper {
    constructor(private readonly currencyService: CurrencyService) {}
    public mapCtOrderToKlaviyoEvent(order: Order, metric: string, time?: string): EventRequest {
        return {
            data: {
                type: 'event',
                attributes: {
                    profile: getCustomerProfileFromOrder(order),
                    metric: {
                        name: metric,
                    },
                    value: this.currencyService.convert(
                        getTypedMoneyAsNumber(order?.totalPrice),
                        order.totalPrice.currencyCode,
                    ),
                    properties: mapAllowedProperties('order', { ...order }) as any,
                    unique_id: order.id,
                    time: time ?? order.createdAt,
                },
            },
        };
    }

    public mapOrderLineToProductOrderedEvent(lineItem: LineItem, order: Order, time?: string): EventRequest {
        return {
            data: {
                type: 'event',
                attributes: {
                    profile: getCustomerProfileFromOrder(order),
                    metric: {
                        name: config.get('order.metrics.orderedProduct'),
                    },
                    value: this.currencyService.convert(
                        getTypedMoneyAsNumber(lineItem.totalPrice),
                        order.totalPrice.currencyCode,
                    ),
                    properties: { ...lineItem },
                    unique_id: lineItem.id,
                    time: time ?? order.createdAt,
                },
            },
        };
    }
}
