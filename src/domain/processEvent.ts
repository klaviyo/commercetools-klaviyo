import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { CustomerCreatedEventProcessor } from './eventProcessors/customer/customerCreatedEventProcessor';
import { OrderCreatedEvent } from './eventProcessors/order/orderCreatedEvent';
import { AbstractEvent } from './eventProcessors/abstractEvent';
import logger from '../utils/log';
import { responseHandler } from './responseHandler';
import { CustomerCompanyNameSetEventProcessor } from './eventProcessors/customer/customerCompanyNameSetEventProcessor';
import { OrderStateChangedEvent } from './eventProcessors/order/orderStateChangedEvent';
import { OrderRefundedEvent } from './eventProcessors/order/orderRefundedEvent';
import { sendEventToKlaviyo } from './klaviyoService'; // export const processEvent = (ctMessage: CloudEventsFormat | PlatformFormat) => {
import { CustomerResourceUpdatedEventProcessor } from './eventProcessors/customer/customerResourceUpdatedEventProcessor';
import { isFulfilled } from '../utils/promise'; // export const processEvent = (ctMessage: CloudEventsFormat | PlatformFormat) => {

// export const processEvent = (ctMessage: CloudEventsFormat | PlatformFormat) => {
// eslint-disable-next-line prettier/prettier
const defaultProcessors: (typeof AbstractEvent)[] = [
    CustomerCreatedEventProcessor,
    CustomerCompanyNameSetEventProcessor,
    OrderCreatedEvent,
    OrderStateChangedEvent,
    OrderRefundedEvent,
    CustomerResourceUpdatedEventProcessor,
];

export const processEvent = async (
    ctMessage: MessageDeliveryPayload,
    eventProcessors: (typeof AbstractEvent)[] = defaultProcessors,
): Promise<ProcessingResult> => {
    // todo check ctMessage.payloadNotIncluded;
    logger.info('Processing commercetools message', ctMessage);
    const klaviyoRequestsPromises = await Promise.allSettled(
        eventProcessors
            .map((eventProcessors) => eventProcessors.instance(ctMessage))
            .filter((eventProcessor) => eventProcessor.isEventValid())
            .map((eventProcessor) => eventProcessor.generateKlaviyoEvents()),
    );
    const response = responseHandler(klaviyoRequestsPromises, ctMessage);
    if (response.status != 'OK') {
        return response;
    }
    const validRequests = klaviyoRequestsPromises.filter(isFulfilled).map((done) => done.value);
    const klaviyoRequestPromises = validRequests.flat().map((klaviyoEvent) => sendEventToKlaviyo(klaviyoEvent));
    const results = await Promise.allSettled(klaviyoRequestPromises);
    return responseHandler(results, ctMessage);
};
