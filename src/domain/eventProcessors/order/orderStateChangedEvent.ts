import { AbstractEvent } from '../abstractEvent';
import logger from '../../../utils/log';
import { OrderStateChangedMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import { OrderState } from '@commercetools/platform-sdk';
import { getTypedMoneyAsNumber } from '../../../utils/get-typed-money-as-number';
import { getCustomerProfileFromOrder } from '../../../utils/get-customer-profile-from-order';
import { getOrderById } from '../../ctService';
import { mapAllowedProperties } from '../../../utils/property-mapper';
import config from 'config';

export class OrderStateChangedEvent extends AbstractEvent {
    isEventValid(): boolean {
        const orderStateChangedMessage = this.ctMessage as unknown as OrderStateChangedMessage;
        return (
            orderStateChangedMessage.resource.typeId === 'order' &&
            this.isValidMessageType(orderStateChangedMessage.type) &&
            this.isValidState(orderStateChangedMessage.orderState)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const orderStateChangedMessage = this.ctMessage as unknown as OrderStateChangedMessage;
        logger.info('Processing order state changed event');

        const ctOrder = await getOrderById(orderStateChangedMessage.resource.id);

        if (!ctOrder) {
            return [];
        }

        const body: EventRequest = {
            data: {
                type: 'event',
                attributes: {
                    profile: getCustomerProfileFromOrder(ctOrder),
                    metric: {
                        name: this.getOrderMetricByState(orderStateChangedMessage.orderState),
                    },
                    value: this.context.currencyService.convert(
                        getTypedMoneyAsNumber(ctOrder?.totalPrice),
                        ctOrder.totalPrice.currencyCode,
                    ),
                    properties: mapAllowedProperties('order', { ...ctOrder }) as any,
                    unique_id: orderStateChangedMessage.resource.id,
                    time: orderStateChangedMessage.createdAt,
                },
            },
        };

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
