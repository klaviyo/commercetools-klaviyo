import { AbstractEvent } from './abstractEvent.js';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import logger from '../../utils/log';

export class OrderCreatedEvent extends AbstractEvent {
    isEventValid(ctMessage: MessageDeliveryPayload): boolean {
        return ctMessage.resource.typeId === 'order';
    }

    process(ctMessage: MessageDeliveryPayload): void {
        console.log('Processing order created event');

        logger.info('Processing order created event, winston logs');
    }
}
