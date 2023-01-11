import { AbstractEvent } from './abstractEvent.js';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';

export class OrderCreatedEvent extends AbstractEvent {
    isEventValid(ctMessage: MessageDeliveryPayload): boolean {
        return ctMessage.resource.typeId === 'order';
    }

    process(ctMessage: MessageDeliveryPayload): void {
        console.log('Processing order created event');
    }
}
