import { AbstractEvent } from './abstractEvent';
import logger from '../../utils/log';
import { OrderCreatedMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import { Order, OrderState } from '@commercetools/platform-sdk';

export class OrderCreatedEvent extends AbstractEvent {
    isEventValid(): boolean {
        const orderCreatedMessage = this.ctMessage as unknown as OrderCreatedMessage;
        return (
            orderCreatedMessage.resource.typeId === 'order' &&
            orderCreatedMessage.type === 'OrderCreated' &&
            !!orderCreatedMessage.order &&
            (!!orderCreatedMessage.order.customerEmail || !!orderCreatedMessage.order.customerId) &&
            this.isValidState(orderCreatedMessage.order?.orderState)
        );
    }

    generateKlaviyoEvent(): KlaviyoEvent {
        const orderCreatedMessage = this.ctMessage as unknown as OrderCreatedMessage;
        logger.info('Processing order created event');

        const body = {
            data: {
                type: 'event',
                attributes: {
                    profile: this.getCustomerProfile(orderCreatedMessage.order),
                    metric: {
                        name: 'Order created',
                    },
                    value: orderCreatedMessage.order?.totalPrice?.centAmount,
                    properties: { ...orderCreatedMessage.order },
                    unique_id: orderCreatedMessage.order.id,
                },
            },
        };

        return {
            body,
        };
    }

    private getCustomerProfile(order: Order): KlaviyoEventProfile {
        const profile: KlaviyoEventProfile = {};
        if (order.customerEmail) {
            profile.$email = order.customerEmail;
        }
        if (order.customerId) {
            profile.$id = order.customerId;
        }
        if (profile.$id || profile.$email) {
            return profile;
        }
        throw new Error(`Customer information not available for order id ${order.id}`);
    }

    private isValidState(orderState: OrderState): boolean {
        return (process.env.ORDER_CREATED_STATES || 'Open').split(/[, ]+/g).includes(orderState);
    }
}
