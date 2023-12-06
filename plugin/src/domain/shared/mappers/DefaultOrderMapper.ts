import { getCustomerProfileFromOrder } from '../../../utils/get-customer-profile-from-order';
import { getTypedMoneyAsNumber } from '../../../utils/get-typed-money-as-number';
import { mapAllowedProperties } from '../../../utils/property-mapper';
import { Category, CategoryReference, LineItem, Order, Product } from '@commercetools/platform-sdk';
import { OrderMapper } from './OrderMapper';
import config from 'config';
import { CurrencyService } from '../services/CurrencyService';
import { CustomerMapper } from './CustomerMapper';
import { getLocalizedStringAsText } from '../../../utils/locale-currency-utils';

export class DefaultOrderMapper implements OrderMapper {
    constructor(private readonly currencyService: CurrencyService, private readonly customerMapper: CustomerMapper) {}
    public mapCtOrderToKlaviyoEvent(
        order: Order,
        orderProducts: Product[],
        metric: string,
        updateAdditionalProfileProperties: boolean,
        time?: string,
    ): EventRequest {
        return {
            data: {
                type: 'event',
                attributes: {
                    profile: getCustomerProfileFromOrder(
                        order,
                        this.customerMapper,
                        updateAdditionalProfileProperties && metric === config.get('order.metrics.placedOrder'),
                    ),
                    metric: {
                        name: metric,
                    },
                    value: this.currencyService.convert(
                        getTypedMoneyAsNumber(order?.totalPrice),
                        order.totalPrice.currencyCode,
                    ),
                    properties: {
                        ...mapAllowedProperties('order', { ...order }),
                        ...mapAllowedProperties('order.customFields', { ...(order.custom?.fields || {}) }),
                        ItemNames: this.mapOrderLineItemsToItemNames(order),
                        Categories: this.getCategoryNamesFromProduct(
                            orderProducts.map((product) => product.masterData.current.categories).flat(),
                        ),
                    } as any,
                    unique_id: order.id,
                    time: time ?? order.createdAt,
                },
            },
        };
    }

    public mapCtRefundedOrderToKlaviyoEvent(
        order: Order,
        orderProducts: Product[],
        metric: string,
        time?: string,
    ): EventRequest {
        const refundAmounts =
            order.paymentInfo?.payments
                .map((p) =>
                    p.obj?.transactions
                        .filter((t) => t.state === 'Success' && t.type === 'Refund')
                        .map((t) => getTypedMoneyAsNumber(t.amount)),
                )
                .flat()
                .filter((r) => r !== undefined) || [];
        const refundTotal = refundAmounts.length ? refundAmounts.reduce((a, b) => (a || 0) + (b || 0)) || 0 : 0;

        return {
            data: {
                type: 'event',
                attributes: {
                    profile: getCustomerProfileFromOrder(order, this.customerMapper),
                    metric: {
                        name: metric,
                    },
                    value: this.currencyService.convert(refundTotal, order.totalPrice.currencyCode),
                    properties: {
                        ...mapAllowedProperties('order', { ...order }),
                        ...mapAllowedProperties('order.customFields', { ...(order.custom?.fields || {}) }),
                        ItemNames: this.mapOrderLineItemsToItemNames(order),
                        Categories: this.getCategoryNamesFromProduct(
                            orderProducts.map((product) => product.masterData.current.categories).flat(),
                        ),
                    } as any,
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
                    profile: getCustomerProfileFromOrder(order, this.customerMapper),
                    metric: {
                        name: config.get('order.metrics.orderedProduct'),
                    },
                    value: this.currencyService.convert(
                        getTypedMoneyAsNumber(lineItem.totalPrice),
                        order.totalPrice.currencyCode,
                    ),
                    properties: {
                        ...lineItem,
                        id: `${lineItem.productId}_${lineItem.variant.id}_${order.locale?.split('-')[0] ?? ''}-${
                            order.store?.key.toUpperCase() ?? ''
                        }`,
                        name: getLocalizedStringAsText(lineItem.name),
                    },
                    unique_id: lineItem.id,
                    time: time ?? order.createdAt,
                },
            },
        };
    }

    private mapOrderLineItemsToItemNames(order: Order): string[] {
        const lineItemNames = order.lineItems.map((item) => getLocalizedStringAsText(item.name));
        const customLineItemNames = order.customLineItems?.map((item) => getLocalizedStringAsText(item.name)) || [];
        return Array.from(new Set(lineItemNames.concat(customLineItemNames)));
    }

    private getCategoryNamesFromProduct(categories: CategoryReference[]): string[] {
        const categoryNames = categories.map((category) => {
            const categoryAncestorNames = (category.obj as Category).ancestors.map((ancestor) =>
                getLocalizedStringAsText((ancestor.obj as Category).name),
            );
            const categoryName = getLocalizedStringAsText((category.obj as Category).name);
            const discreteCategoryNames = categoryAncestorNames.concat(categoryName);
            return discreteCategoryNames.map((name, index) => {
                const ancestorNames = [];
                for (let i = index; i >= 0; i--) {
                    ancestorNames.push(discreteCategoryNames[i]);
                }
                return ancestorNames.reverse().join(' > ');
            });
        });

        // Conversion from Array -> Set -> Array removes duplicate entries.
        // Useful for certain cases where you have a common main category such as:
        // Women > Pants > Jeans and Women > Seasonal Fashion > Fall
        return Array.from(new Set(categoryNames.flat()));
    }
}
