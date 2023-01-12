import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { CustomerCreatedEvent } from './eventProcessors/customerCreatedEvent.js';
import { OrderCreatedEvent } from './eventProcessors/orderCreatedEvent.js';
import { AbstractEvent } from './eventProcessors/abstractEvent.js';

// export const processEvent = (ctMessage: CloudEventsFormat | PlatformFormat) => {
const eventProcessors: AbstractEvent[] = [new CustomerCreatedEvent(), new OrderCreatedEvent()];
export const processEvent = async (ctMessage: MessageDeliveryPayload) => {
    // todo check ctMessage.payloadNotIncluded;
    eventProcessors
        .filter((eventProcessor) => eventProcessor.isEventValid(ctMessage))
        .map((eventProcessor) => eventProcessor.process(ctMessage));
};