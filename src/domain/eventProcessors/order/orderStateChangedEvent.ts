import { AbstractEvent } from '../abstractEvent';
import logger from '../../../utils/log';
import { OrderStateChangedMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import { OrderState } from '@commercetools/platform-sdk';
import { getTypedMoneyAsNumber } from '../../../utils/get-typed-money-as-number';
import { getConfigProperty } from '../../../utils/prop-mapper';
import { getCustomerProfileFromOrder } from '../../../utils/get-customer-profile-from-order';
import { getOrderById } from '../../ctService';

export class OrderStateChangedEvent extends AbstractEvent {
    isEventValid(): boolean {
        const orderStateChangedMessage = this.ctMessage as unknown as OrderStateChangedMessage;
        return (
            orderStateChangedMessage.resource.typeId === 'order' &&
            orderStateChangedMessage.type === 'OrderStateChanged' &&
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

        const body = {
            data: {
                type: 'event',
                attributes: {
                    profile: getCustomerProfileFromOrder(ctOrder),
                    metric: {
                        name: this.getOrderMetricByState(orderStateChangedMessage.orderState),
                    },
                    value: getTypedMoneyAsNumber(ctOrder.totalPrice),
                    properties: { ...ctOrder } as any,
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
        return Boolean(getConfigProperty('order.changedStates', orderState));
    }

    private getOrderMetricByState(orderState: OrderState): string {
        return getConfigProperty('order.changedStates', orderState);
    }
}
