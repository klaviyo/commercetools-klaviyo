import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import {
    MessageDeliveryPayload,
    Order,
    OrderCreatedMessage,
    OrderCustomerSetMessage,
    OrderState,
    Product,
} from '@commercetools/platform-sdk';
import config from 'config';
import { PaginatedProductResults } from '../../../../infrastructure/driven/commercetools/DefaultCtProductService';

export class OrderCreatedEvent extends AbstractEventProcessor {
    private readonly PROCESSOR_NAME = 'OrderCreated';

    isEventValid(): boolean {
        const message = this.ctMessage as unknown as OrderCreatedMessage | OrderCustomerSetMessage;
        return (
            message.resource.typeId === 'order' &&
            this.isValidMessageType(
                (message as unknown as MessageDeliveryPayload).payloadNotIncluded?.payloadType || message.type,
            ) &&
            this.hasExpectedMessageProperties(message) &&
            !this.isEventDisabled(this.PROCESSOR_NAME)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as OrderCreatedMessage | OrderCustomerSetMessage;
        logger.info('Processing order created event');

        let order: Order;
        if ('order' in message) {
            order = message.order;
        } else {
            order = (await this.context.ctOrderService.getOrderById(message.resource.id)) as Order;
        }

        let orderProducts: Product[] = [];
        let ctProductsResult: PaginatedProductResults | undefined;
        do {
            try {
                ctProductsResult = await this.context.ctProductService.getProductsByIdRange(
                    order.lineItems.map((item) => item.productId),
                    ctProductsResult?.lastId,
                );
                orderProducts = orderProducts.concat(ctProductsResult.data);
            } catch (err) {
                logger.info(`Failed to get product details for order: ${order.id}`, err);
            }
        } while ((ctProductsResult as PaginatedProductResults)?.hasMore);

        const body: EventRequest = this.context.orderMapper.mapCtOrderToKlaviyoEvent(
            order,
            orderProducts,
            config.get('order.metrics.placedOrder'),
            true,
        );

        const events: KlaviyoEvent[] = [{ body, type: 'event' }];

        this.getProductOrderedEventsFromOrder(events, order);

        return Promise.resolve(events);
    }

    private getProductOrderedEventsFromOrder(events: KlaviyoEvent[], order: Order) {
        const eventTime: Date = new Date(order.createdAt);
        eventTime.setSeconds(eventTime.getSeconds() + 1);
        order?.lineItems?.forEach((lineItem) => {
            events.push({
                body: this.context.orderMapper.mapOrderLineToProductOrderedEvent(
                    lineItem,
                    order,
                    eventTime.toISOString(),
                ),
                type: 'event',
            });
        });
    }

    private isValidState(orderState: OrderState): boolean {
        return Boolean(
            config.has('order.states.created') &&
                (config.get('order.states.created.placedOrder') as string[])?.includes(orderState),
        );
    }

    private isValidMessageType(type: string): boolean {
        return Boolean(
            config.has('order.messages.created') && (config.get('order.messages.created') as string[])?.includes(type),
        );
    }

    private hasExpectedMessageProperties(message: OrderCreatedMessage | OrderCustomerSetMessage) {
        return (
            !!(message as unknown as MessageDeliveryPayload).payloadNotIncluded ||
            !!(message as OrderCustomerSetMessage).customer ||
            (!!(message as OrderCreatedMessage).order &&
                (!!(message as OrderCreatedMessage).order?.customerEmail ||
                    !!(message as OrderCreatedMessage).order?.customerId) &&
                this.isValidState((message as OrderCreatedMessage).order?.orderState))
        );
    }
}
