import { AbstractEvent } from '../abstractEvent';
import logger from '../../../utils/log';
import { ReturnInfoSetMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import { ReturnInfo } from '@commercetools/platform-sdk';
import { getTypedMoneyAsNumber } from '../../../utils/get-typed-money-as-number';
import { getCustomerProfileFromOrder } from '../../../utils/get-customer-profile-from-order';
import { getOrderById } from '../../ctService';
import { mapAllowedProperties } from '../../../utils/property-mapper';
import config from 'config';

export class OrderRefundedEvent extends AbstractEvent {
    isEventValid(): boolean {
        const returnInfoSetMessage = this.ctMessage as unknown as ReturnInfoSetMessage;

        return (
            returnInfoSetMessage.resource.typeId === 'order' &&
            returnInfoSetMessage.type === 'ReturnInfoSet' &&
            !!returnInfoSetMessage.returnInfo &&
            this.isValidState(returnInfoSetMessage.returnInfo)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const orderStateChangedMessage = this.ctMessage as unknown as ReturnInfoSetMessage;
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
                        name: config.get('order.metrics.refundedOrder'),
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

    private isValidState(returnInfo: ReturnInfo[]): boolean {
        return Boolean(
            returnInfo
                .map((x) => x.items)
                .flat()
                .find((item) => item.paymentState === 'Refunded'),
        );
    }
}
