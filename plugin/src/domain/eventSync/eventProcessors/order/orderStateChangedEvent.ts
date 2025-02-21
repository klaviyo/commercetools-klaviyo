import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { OrderStateChangedMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import { OrderState, Product } from '@commercetools/platform-sdk';
import config from 'config';
import { PaginatedProductResults } from '../../../../infrastructure/driven/commercetools/DefaultCtProductService';
import { EventRequest } from '../../../../types/klaviyo-types';
import { KlaviyoEvent } from '../../../../types/klaviyo-plugin';

export class OrderStateChangedEvent extends AbstractEventProcessor {
    private readonly PROCESSOR_NAME = ' OrderStateChanged';

    isEventValid(): boolean {
        const orderStateChangedMessage = this.ctMessage as unknown as OrderStateChangedMessage;
        return (
            orderStateChangedMessage.resource.typeId === 'order' &&
            this.isValidMessageType(orderStateChangedMessage.type) &&
            this.isValidState(orderStateChangedMessage.orderState) &&
            !this.isEventDisabled(this.PROCESSOR_NAME)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const orderStateChangedMessage = this.ctMessage as unknown as OrderStateChangedMessage;
        logger.info('Processing order state changed event');

        const ctOrder = await this.context.ctOrderService.getOrderById(orderStateChangedMessage.resource.id);

        if (!ctOrder) {
            return [];
        }

        let orderProducts: Product[] = [];
        let ctProductsResult: PaginatedProductResults | undefined;
        do {
            try {
                ctProductsResult = await this.context.ctProductService.getProductsByIdRange(
                    ctOrder.lineItems.map((item) => item.productId),
                    ctProductsResult?.lastId,
                );
                orderProducts = orderProducts.concat(ctProductsResult.data);
            } catch (err) {
                logger.info(`Failed to get product details for order: ${ctOrder.id}`, err);
            }
        } while ((ctProductsResult as PaginatedProductResults)?.hasMore);

        const body: EventRequest = this.context.orderMapper.mapCtOrderToKlaviyoEvent(
            ctOrder,
            orderProducts,
            this.getOrderMetricByState(orderStateChangedMessage.orderState),
            false,
            ctOrder.lastModifiedAt,
        );

        return [
            {
                body,
                type: 'event',
            },
        ];
    }

    private isValidState(orderState: OrderState): boolean {
        return Boolean(
            config.has('order.states.changed') &&
                ((config.get('order.states.changed.cancelledOrder') as string[])?.includes(orderState) ||
                    (config.get('order.states.changed.fulfilledOrder') as string[])?.includes(orderState)),
        );
    }

    private isValidMessageType(type: string): boolean {
        return Boolean(
            config.has('order.messages.changed') && (config.get('order.messages.changed') as string[])?.includes(type),
        );
    }

    private getOrderMetricByState(orderState: OrderState): string {
        const changedStates: any = config.get('order.states.changed');
        const orderMetrics: any = config.get('order.metrics');
        const stateProperty = Object.entries(changedStates).filter((state) =>
            (state[1] as string[]).includes(orderState),
        )[0][0];
        return orderMetrics[stateProperty];
    }
}
