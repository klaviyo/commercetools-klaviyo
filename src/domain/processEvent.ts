import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { CustomerCreatedEvent } from './eventProcessors/customerCreatedEvent';
import { OrderCreatedEvent } from './eventProcessors/orderCreatedEvent';
import { AbstractEvent } from './eventProcessors/abstractEvent';
import logger from '../utils/log';
import { sendEventToKlaviyo } from './klaviyoService';
import { ProductPublishedEvent } from './eventProcessors/productPublishedEvent';
import { responseHandler } from './responseHandler';

// export const processEvent = (ctMessage: CloudEventsFormat | PlatformFormat) => {
// eslint-disable-next-line prettier/prettier
const defaultProcessors: (typeof AbstractEvent)[] = [CustomerCreatedEvent, OrderCreatedEvent, ProductPublishedEvent];

export const processEvent = async (
    ctMessage: MessageDeliveryPayload,
    eventProcessors: (typeof AbstractEvent)[] = defaultProcessors,
): Promise<ProcessingResult> => {
    // todo check ctMessage.payloadNotIncluded;
    logger.info('Processing commercetools message', ctMessage);
    const promises = eventProcessors
        .map((eventProcessors) => eventProcessors.instance(ctMessage))
        .filter((eventProcessor) => eventProcessor.isEventValid())
        .map((eventProcessor) => eventProcessor.generateKlaviyoEvents())
        .flat()
        .filter((event) => !!event.body)
        .map((klaviyoEvent) => sendEventToKlaviyo(klaviyoEvent));

    const results = await Promise.allSettled(promises);
    return responseHandler(results, ctMessage);
};
