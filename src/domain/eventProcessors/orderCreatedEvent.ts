import { AbstractEvent } from './abstractEvent';
import logger from '../../utils/log';
import { OrderCreatedMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import { Order } from '@commercetools/platform-sdk';

export class OrderCreatedEvent extends AbstractEvent {
    isEventValid(): boolean {
        const orderCreatedMessage = this.ctMessage as unknown as OrderCreatedMessage;
        return (
            orderCreatedMessage.resource.typeId === 'order' &&
            orderCreatedMessage.type === 'OrderCreated' &&
            !!orderCreatedMessage.order &&
            (!!orderCreatedMessage.order.customerEmail || !!orderCreatedMessage.order.customerId)
        );
    }

    generateKlaviyoEvent(): KlaviyoEvent {
        const orderCreatedMessage = this.ctMessage as unknown as OrderCreatedMessage;
        logger.info('Processing order created event');

        const body = {
            data: {
                type: 'event',
                attributes: {
                    profile: {
                        email: this.getCustomerEmail(orderCreatedMessage.order),
                    },
                    metric: {
                        name: 'Order created',
                    },
                    properties: { ...orderCreatedMessage.order },
                    unique_id: orderCreatedMessage.order.id,
                },
            },
        };
        return {
            body,
        };
    }

    private getCustomerEmail(order: Order): string {
        if (order.customerEmail) {
            return order.customerEmail;
        }
        if (order.customerId) {
            //get customer email from CT
            return 'fix@me.com';
        }
        throw new Error(`Customer information not available for order id ${order.id}`);
    }
}
