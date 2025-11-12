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
import { EventRequest } from '../../../../types/klaviyo-types';
import { KlaviyoEvent } from '../../../../types/klaviyo-plugin';

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

        // Step 1: For guest orders (email but no customerId), check for existing profile if deduplication enabled
        let klaviyoProfileId: string | undefined;
        if (
            this.context.profileDeduplicationService.shouldDeduplicate() &&
            order.customerEmail &&
            !order.customerId
        ) {
            // Step 2: Search for existing profile by email FIRST
            const deduplicationResult = await this.context.profileDeduplicationService.findExistingProfileByEmail(
                order.customerEmail,
            );

            // Step 3: If found, use the Klaviyo profile ID for order events
            if (deduplicationResult.existingProfile && deduplicationResult.klaviyoProfileId) {
                logger.debug(
                    `Order event: Found existing profile for email ${order.customerEmail}. Using profile ID: ${deduplicationResult.klaviyoProfileId}`,
                );
                klaviyoProfileId = deduplicationResult.klaviyoProfileId;

                // Step 4: If profile is missing external_id and we have customerId from order, update it
                // Note: This handles the case where order.customerId might be set later
                if (order.customerId && deduplicationResult.needsUpdate) {
                    logger.info(
                        `Order event: Updating profile ${deduplicationResult.klaviyoProfileId} with external_id ${order.customerId}`,
                    );
                    // Update profile with external_id - this happens asynchronously, don't wait
                    this.context.klaviyoService
                        .sendEventToKlaviyo({
                            type: 'profileResourceUpdated',
                            body: this.context.customerMapper.mapCtCustomerToKlaviyoProfile(
                                { id: order.customerId, email: order.customerEmail } as any,
                                deduplicationResult.klaviyoProfileId,
                            ),
                        })
                        .catch((e) => logger.error('Error updating profile with external_id from order', e));
                }
            }
        }

        const body: EventRequest = this.context.orderMapper.mapCtOrderToKlaviyoEvent(
            order,
            orderProducts,
            config.get('order.metrics.placedOrder'),
            true,
            undefined,
            klaviyoProfileId,
        );

        const events: KlaviyoEvent[] = [{ body, type: 'event' }];

        this.getProductOrderedEventsFromOrder(events, order, klaviyoProfileId);

        return Promise.resolve(events);
    }

    private getProductOrderedEventsFromOrder(events: KlaviyoEvent[], order: Order, klaviyoProfileId?: string) {
        const eventTime: Date = new Date(order.createdAt);
        eventTime.setSeconds(eventTime.getSeconds() + 1);
        order?.lineItems?.forEach((lineItem) => {
            events.push({
                body: this.context.orderMapper.mapOrderLineToProductOrderedEvent(
                    lineItem,
                    order,
                    eventTime.toISOString(),
                    klaviyoProfileId,
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
