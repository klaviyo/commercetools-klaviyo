import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import {
    PaymentTransactionAddedMessage,
    PaymentTransactionStateChangedMessage,
    Transaction,
} from '@commercetools/platform-sdk';
import { getTypedMoneyAsNumber } from '../../../../utils/get-typed-money-as-number';
import { getCustomerProfileFromOrder } from '../../../../utils/get-customer-profile-from-order';
import { getOrderByPaymentId, getPaymentById } from '../../../../infrastructure/driven/commercetools/ctService';
import { mapAllowedProperties } from '../../../../utils/property-mapper';
import config from 'config';

export class OrderRefundedEvent extends AbstractEventProcessor {
    isEventValid(): boolean {
        const message = this.ctMessage as unknown as
            | PaymentTransactionAddedMessage
            | PaymentTransactionStateChangedMessage;

        return (
            message.resource.typeId === 'payment' &&
            this.isValidMessageType(message.type) &&
            this.hasExpectedMessageProperties(message)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as
            | PaymentTransactionAddedMessage
            | PaymentTransactionStateChangedMessage;
        logger.info('Processing payment transaction state changed event');

        const payment = await getPaymentById(message.resource.id);
        let transaction: Transaction | undefined;
        if ('transaction' in message) {
            transaction = message.transaction;
        } else {
            transaction = payment.transactions.find(
                (transaction) => transaction.id === message.transactionId && transaction.type === 'Refund',
            );
        }
        if (!transaction) {
            return [];
        }

        const ctOrder = await getOrderByPaymentId(message.resource.id);

        const body: EventRequest = this.context.orderMapper.mapCtRefundedOrderToKlaviyoEvent(
            ctOrder,
            config.get('order.metrics.refundedOrder'),
            ctOrder.lastModifiedAt,
        );

        return [
            {
                body,
                type: 'event',
            },
        ];
    }

    private isValidMessageType(type: string): boolean {
        return Boolean(
            (config.has('payment.messages.transactionAdded') &&
                (config.get('payment.messages.transactionAdded') as string[])?.includes(type)) ||
                (config.has('payment.messages.transactionChanged') &&
                    (config.get('payment.messages.transactionChanged') as string[])?.includes(type)),
        );
    }

    private isValidState(message: PaymentTransactionAddedMessage | PaymentTransactionStateChangedMessage): boolean {
        return Boolean(
            config.has('payment.states.validTransactionStates') &&
                (config.get('payment.states.validTransactionStates') as string[])?.includes(
                    (message as PaymentTransactionAddedMessage)?.transaction?.state ||
                        (message as PaymentTransactionStateChangedMessage)?.state,
                ),
        );
    }

    private hasExpectedMessageProperties(
        message: PaymentTransactionAddedMessage | PaymentTransactionStateChangedMessage,
    ) {
        return (
            ((message as PaymentTransactionAddedMessage)?.transaction?.type === 'Refund' ||
                !!(message as PaymentTransactionStateChangedMessage)?.transactionId) &&
            this.isValidState(message)
        );
    }
}
