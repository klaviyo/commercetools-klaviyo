import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { CustomerCreatedEvent } from './eventProcessors/customerCreatedEvent';
import { OrderCreatedEvent } from './eventProcessors/orderCreatedEvent';
import { AbstractEvent } from './eventProcessors/abstractEvent';
import logger from '../utils/log';
import { sendEventToKlaviyo } from './klaviyoService';
import { ProductPublishedEvent } from './eventProcessors/productPublishedEvent';

// export const processEvent = (ctMessage: CloudEventsFormat | PlatformFormat) => {
const eventProcessors: typeof AbstractEvent[] = [CustomerCreatedEvent, OrderCreatedEvent, ProductPublishedEvent];

export const processEvent = (ctMessage: MessageDeliveryPayload) => {
    // todo check ctMessage.payloadNotIncluded;
    logger.info('Processing commercetools message:', ctMessage);
    eventProcessors
        .map((eventProcessors) => eventProcessors.instance(ctMessage))
        .filter((eventProcessor) => eventProcessor.isEventValid())
        .map((eventProcessor) => eventProcessor.generateKlaviyoEvent())
        .map((klaviyoEvent) => sendEventToKlaviyo(klaviyoEvent));
};
