import { AbstractEvent } from '../abstractEvent';
import logger from '../../../utils/log';
import { Order, OrderCreatedMessage, OrderCustomerSetMessage, OrderState } from '@commercetools/platform-sdk';
import { getTypedMoneyAsNumber } from '../../../utils/get-typed-money-as-number';
import { getCustomerProfileFromOrder } from '../../../utils/get-customer-profile-from-order';
import { getOrderById } from '../../ctService';
import { mapAllowedProperties } from '../../../utils/property-mapper';
import config from 'config';

export class OrderCreatedEvent extends AbstractEvent {
    isEventValid(): boolean {
        const message = this.ctMessage as unknown as OrderCreatedMessage | OrderCustomerSetMessage;
        return (
            message.resource.typeId === 'order' &&
            this.isValidMessageType(message.type) &&
            this.hasExpectedMessageProperties(message)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as OrderCreatedMessage | OrderCustomerSetMessage;
        logger.info('Processing order created event');

        let order: Order;
        if ('order' in message) {
            order = message.order;
        } else {
            order = (await getOrderById(message.resource.id)) as Order;
        }

        const body: EventRequest = {
            data: {
                type: 'event',
                attributes: {
                    profile: getCustomerProfileFromOrder(order),
                    metric: {
                        name: config.get('order.metrics.placedOrder'),
                    },
                    value: this.context.currencyService.convert(
                        getTypedMoneyAsNumber(order?.totalPrice),
                        order.totalPrice.currencyCode,
                    ),
                    properties: mapAllowedProperties('order', { ...order }) as any,
                    unique_id: order.id,
                    time: order.createdAt,
                },
            },
        };

        const events: KlaviyoEvent[] = [{ body, type: 'event' }];

        this.getProductOrderedEventsFromOrder(events, order);

        return Promise.resolve(events);
    }

    private getCustomerProfile(order: Order): KlaviyoEventProfile {
        const profile: KlaviyoEventProfile = {};
        if (order.customerEmail) {
            profile.$email = order.customerEmail;
        }
        if (order.customerId) {
            profile.$id = order.customerId;
        }
        return profile;
    }

    private getProductOrderedEventsFromOrder(events: KlaviyoEvent[], order: Order) {
        order?.lineItems?.forEach((lineItem) => {
            events.push({
                body: {
                    data: {
                        type: 'event',
                        attributes: {
                            profile: this.getCustomerProfile(order),
                            metric: {
                                name: config.get('order.metrics.orderedProduct'),
                            },
                            value: getTypedMoneyAsNumber(lineItem.totalPrice),
                            properties: { ...lineItem },
                            unique_id: lineItem.id,
                            time: order.createdAt,
                        },
                    },
                },
                type: 'event',
            });
        });
    }

    private isValidState(orderState: OrderState): boolean {
        return Boolean(
            config.has('order.states.created') &&
                (config.get('order.states.created.placedOrder') as string[])?.includes(orderState),
        );
    }

    private isValidMessageType(type: string): boolean {
        return Boolean(
            config.has('order.messages.created') && (config.get('order.messages.created') as string[])?.includes(type),
        );
    }

    private hasExpectedMessageProperties(message: OrderCreatedMessage | OrderCustomerSetMessage) {
        return (
            !!(message as OrderCustomerSetMessage).customer ||
            (!!(message as OrderCreatedMessage).order &&
                (!!(message as OrderCreatedMessage).order?.customerEmail ||
                    !!(message as OrderCreatedMessage).order?.customerId) &&
                this.isValidState((message as OrderCreatedMessage).order?.orderState))
        );
    }
}
