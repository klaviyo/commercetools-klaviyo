import { AbstractEvent } from './abstractEvent';
import logger from '../../utils/log';

export class OrderCreatedEvent extends AbstractEvent {
    // constructor(private readonly ctMessage: MessageDeliveryPayload) {
    //     super(ctMessage);
    // }
    isEventValid(): boolean {
        return this.ctMessage.resource.typeId === 'order';
    }

    generateKlaviyoEvent(): KlaviyoEvent {
        logger.info('Processing order created event');

        const body = {
            data: {
                type: 'event',
                attributes: {
                    profile: {
                        email: 'john.smith@e2x.com',
                    },
                    metric: {
                        name: 'Order created',
                    },
                    properties: { ...this.ctMessage.resource },
                    unique_id: '1234567',
                },
            },
        };
        return {
            body,
        };
    }
}
