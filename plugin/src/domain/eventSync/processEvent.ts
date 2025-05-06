import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { CustomerCreatedEventProcessor } from './eventProcessors/customer/customerCreatedEventProcessor';
import { OrderCreatedEvent } from './eventProcessors/order/orderCreatedEvent';
import { AbstractEventProcessor } from './eventProcessors/abstractEventProcessor';
import logger from '../../utils/log';
import { responseHandler } from './responseHandler';
import { CustomerCompanyNameSetEventProcessor } from './eventProcessors/customer/customerCompanyNameSetEventProcessor';
import { OrderStateChangedEvent } from './eventProcessors/order/orderStateChangedEvent';
import { OrderRefundedEvent } from './eventProcessors/order/orderRefundedEvent';
import { CustomerResourceUpdatedEventProcessor } from './eventProcessors/customer/customerResourceUpdatedEventProcessor';
import { isFulfilled } from '../../utils/promise';
import { DummyCurrencyService } from '../shared/services/dummyCurrencyService';
import { KlaviyoService } from '../../infrastructure/driven/klaviyo/KlaviyoService';
import { KlaviyoSdkService } from '../../infrastructure/driven/klaviyo/KlaviyoSdkService';
import { Context } from '../../types/klaviyo-context';
import { DefaultOrderMapper } from '../shared/mappers/DefaultOrderMapper';
import { DefaultCustomerMapper } from '../shared/mappers/DefaultCustomerMapper';
import { DefaultCategoryMapper } from '../shared/mappers/DefaultCategoryMapper';
import { DefaultProductMapper } from '../shared/mappers/DefaultProductMapper';
import { CategoryCreatedEventProcessor } from './eventProcessors/category/categoryCreatedEventProcessor';
import { CategoryResourceDeletedEventProcessor } from './eventProcessors/category/categoryResourceDeletedEventProcessor';
import { CategoryResourceUpdatedEventProcessor } from './eventProcessors/category/categoryResourceUpdatedEventProcessor';
import { ProductResourceDeletedEventProcessor } from './eventProcessors/product/productResourceDeletedEventProcessor';
import { ProductUnpublishedEventProcessor } from './eventProcessors/product/productUnpublishedEventProcessor';
import { getApiRoot } from '../../infrastructure/driven/commercetools/ctService';
import { DefaultCtCustomerService } from '../../infrastructure/driven/commercetools/DefaultCtCustomerService';
import { DefaultCtProductService } from '../../infrastructure/driven/commercetools/DefaultCtProductService';
import { DefaultCtCategoryService } from '../../infrastructure/driven/commercetools/DefaultCtCategoryService';
import { DefaultCtPaymentService } from '../../infrastructure/driven/commercetools/DefaultCtPaymentService';
import { DefaultCtOrderService } from '../../infrastructure/driven/commercetools/DefaultCtOrderService';
import { InventoryResourceUpdatedEventProcessor } from './eventProcessors/inventory/inventoryResourceUpdatedEventProcessor';
import { ProductPublishedEventProcessor } from './eventProcessors/product/productPublishedEventProcessor';
import { ProcessingResult } from '../../types/klaviyo-plugin';

const context: Context = {
    klaviyoService: new KlaviyoSdkService(),
    orderMapper: new DefaultOrderMapper(new DummyCurrencyService(), new DefaultCustomerMapper()),
    customerMapper: new DefaultCustomerMapper(),
    categoryMapper: new DefaultCategoryMapper(),
    productMapper: new DefaultProductMapper(new DummyCurrencyService()),
    ctCustomerService: new DefaultCtCustomerService(getApiRoot()),
    ctProductService: new DefaultCtProductService(getApiRoot()),
    ctCategoryService: new DefaultCtCategoryService(getApiRoot()),
    ctPaymentService: new DefaultCtPaymentService(getApiRoot()),
    ctOrderService: new DefaultCtOrderService(getApiRoot()),
};

const defaultProcessors: (typeof AbstractEventProcessor)[] = [
    CustomerCreatedEventProcessor,
    CustomerCompanyNameSetEventProcessor,
    OrderCreatedEvent,
    OrderStateChangedEvent,
    OrderRefundedEvent,
    CustomerResourceUpdatedEventProcessor,
    CategoryCreatedEventProcessor,
    CategoryResourceDeletedEventProcessor,
    CategoryResourceUpdatedEventProcessor,
    ProductResourceDeletedEventProcessor,
    ProductUnpublishedEventProcessor,
    InventoryResourceUpdatedEventProcessor,
    ProductPublishedEventProcessor,
];

export const processEvent = async (
    ctMessage: MessageDeliveryPayload,
    klaviyoService: KlaviyoService,
    eventProcessors: (typeof AbstractEventProcessor)[] = defaultProcessors,
): Promise<ProcessingResult> => {
    logger.info(`Processing commercetools message with id ${ctMessage.id}`);
    const klaviyoRequestsPromises = await Promise.allSettled(
        eventProcessors
            .map((eventProcessors) => eventProcessors.instance(ctMessage, context))
            .filter((eventProcessor) => eventProcessor.isEventValid())
            .map((eventProcessor) => eventProcessor.generateKlaviyoEvents()),
    );
    const response = responseHandler(klaviyoRequestsPromises, ctMessage, false);
    if (response.status != 'OK') {
        return response;
    }
    const validRequests = klaviyoRequestsPromises.filter(isFulfilled).map((done) => done.value);
    const klaviyoRequestPromises = validRequests
        .flat()
        .map((klaviyoEvent) => klaviyoService.sendEventToKlaviyo(klaviyoEvent));
    const results = await Promise.allSettled(klaviyoRequestPromises);
    return responseHandler(results, ctMessage);
};
