import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { CustomerCreatedEvent } from './eventProcessors/customerCreatedEvent.js';
import { OrderCreatedEvent } from './eventProcessors/orderCreatedEvent.js';
import { AbstractEvent } from './eventProcessors/abstractEvent.js';
import logger from '../utils/log';
import { sendEventToKlaviyo } from './eventProcessors/klaviyoService.js';

// export const processEvent = (ctMessage: CloudEventsFormat | PlatformFormat) => {
const eventProcessors: typeof AbstractEvent[] = [CustomerCreatedEvent, OrderCreatedEvent];

export const processEvent = (ctMessage: MessageDeliveryPayload) => {
    // todo check ctMessage.payloadNotIncluded;
    logger.info('Processing commercetools message:', JSON.stringify(ctMessage));
    eventProcessors
        .map((eventProcessors) => eventProcessors.instance(ctMessage))
        .filter((eventProcessor) => eventProcessor.isEventValid())
        .map((eventProcessor) => eventProcessor.generateKlaviyoEvent())
        .map((klaviyoEvent) => sendEventToKlaviyo(klaviyoEvent));
};
