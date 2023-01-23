import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { CustomerCreatedEvent } from './eventProcessors/customerCreatedEvent';
import { OrderCreatedEvent } from './eventProcessors/orderCreatedEvent';
import { AbstractEvent } from './eventProcessors/abstractEvent';
import logger from '../utils/log';
import { sendEventToKlaviyo } from './klaviyoService';
import { ProductPublishedEvent } from './eventProcessors/productPublishedEvent';

// export const processEvent = (ctMessage: CloudEventsFormat | PlatformFormat) => {
const eventProcessors: (typeof AbstractEvent)[] = [CustomerCreatedEvent, OrderCreatedEvent, ProductPublishedEvent];

export const processEvent = async (ctMessage: MessageDeliveryPayload) => {
    // todo check ctMessage.payloadNotIncluded;
    logger.info('Processing commercetools message', ctMessage);
    const promises = eventProcessors
        .map((eventProcessors) => eventProcessors.instance(ctMessage))
        .filter((eventProcessor) => eventProcessor.isEventValid())
        .map((eventProcessor) => eventProcessor.generateKlaviyoEvent())
        .filter((event) => !!event.body)
        .map((klaviyoEvent) => sendEventToKlaviyo(klaviyoEvent));

    const results = await Promise.allSettled(promises);
    const rejected = results.filter((result) => result.status === 'rejected');
    const fulfilled = results.filter((result) => result.status === 'fulfilled');

    if (results.length === 0) {
        logger.warn(
            `No processor found to handle the message. Message with type '${ctMessage.resource.typeId}' ignored`,
        );
    }
    if (results.length > 0) {
        logger.info(`Events to be sent to klaviyo: ${results.length}`);
        logger.info(`Events sent correctly: ${fulfilled.length}`);
    }
    if (rejected.length > 0) {
        logger.error(`Events failed: ${rejected.length}`);
        rejected.forEach((error, index) => logger.error(`Request ${index + 1} failed with error`, error));
        throw new Error('Failed to send data to klaviyo');
    }
};
