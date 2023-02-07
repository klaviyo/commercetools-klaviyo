import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { CustomerCreatedEvent } from './eventProcessors/customer/customerCreatedEvent';
import { OrderCreatedEvent } from './eventProcessors/order/orderCreatedEvent';
import { AbstractEvent } from './eventProcessors/abstractEvent';
import logger from '../utils/log';
import { responseHandler } from './responseHandler';
import { CustomerFirstNameSetEventProcessor } from './eventProcessors/customer/customerFirstNameSetEventProcessor';
import { CustomerLastNameSetEventProcessor } from './eventProcessors/customer/customerLastNameSetEventProcessor';
import { CustomerTitleSetEventProcessor } from './eventProcessors/customer/customerTitleSetEventProcessor';
import { CustomerCompanyNameSetEventProcessor } from './eventProcessors/customer/customerCompanyNameSetEventProcessor';
import { CustomerAddressUpdateEventProcessor } from './eventProcessors/customer/customerAddressUpdateEventProcessor';
import { OrderStateChangedEvent } from './eventProcessors/order/orderStateChangedEvent';
import { OrderRefundedEvent } from './eventProcessors/order/orderRefundedEvent';
import { sendEventToKlaviyo } from './klaviyoService'; // export const processEvent = (ctMessage: CloudEventsFormat | PlatformFormat) => {

// export const processEvent = (ctMessage: CloudEventsFormat | PlatformFormat) => {
// eslint-disable-next-line prettier/prettier
const defaultProcessors: (typeof AbstractEvent)[] = [
    CustomerCreatedEvent,
    CustomerFirstNameSetEventProcessor,
    CustomerLastNameSetEventProcessor,
    CustomerTitleSetEventProcessor,
    CustomerCompanyNameSetEventProcessor,
    OrderCreatedEvent,
    OrderStateChangedEvent,
    OrderRefundedEvent,
    CustomerAddressUpdateEventProcessor,
];

export const processEvent = async (
    ctMessage: MessageDeliveryPayload,
    eventProcessors: (typeof AbstractEvent)[] = defaultProcessors,
): Promise<ProcessingResult> => {
    // todo check ctMessage.payloadNotIncluded;
    logger.info('Processing commercetools message', ctMessage);
    const eventPromises = await Promise.all(
        eventProcessors
            .map((eventProcessors) => eventProcessors.instance(ctMessage))
            .filter((eventProcessor) => eventProcessor.isEventValid())
            .map((eventProcessor) => eventProcessor.generateKlaviyoEvents()),
    );
    const klaviyoRequestPromises = eventPromises.flat().map((klaviyoEvent) => sendEventToKlaviyo(klaviyoEvent));

    const results = await Promise.allSettled(klaviyoRequestPromises);
    return responseHandler(results, ctMessage);
};
