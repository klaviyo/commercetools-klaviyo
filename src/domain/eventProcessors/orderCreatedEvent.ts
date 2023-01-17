import { AbstractEvent } from './abstractEvent';
import logger from '../../utils/log';
import { OrderCreatedMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';

export class OrderCreatedEvent extends AbstractEvent {
    // constructor(private readonly ctMessage: MessageDeliveryPayload) {
    //     super(ctMessage);
    // }
    isEventValid(): boolean {
        const orderCreatedMessage = this.ctMessage as unknown as OrderCreatedMessage;
        return (
            orderCreatedMessage.resource.typeId === 'order' &&
            orderCreatedMessage.type === 'OrderCreated' &&
            !!orderCreatedMessage.order
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
                        email: 'paul.smith@e2x.com',
                    },
                    metric: {
                        name: 'Order created',
                    },
                    properties: { ...orderCreatedMessage.order },
                    unique_id: '12345678',
                },
            },
        };
        return {
            body,
        };
    }
}
