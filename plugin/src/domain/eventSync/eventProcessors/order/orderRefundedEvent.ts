import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import {
    PaymentTransactionAddedMessage,
    PaymentTransactionStateChangedMessage,
    Product,
    Transaction,
} from '@commercetools/platform-sdk';
import config from 'config';
import { PaginatedProductResults } from '../../../../infrastructure/driven/commercetools/DefaultCtProductService';

export class OrderRefundedEvent extends AbstractEventProcessor {
    private readonly PROCESSOR_NAME = 'OrderRefunded';

    isEventValid(): boolean {
        const message = this.ctMessage as unknown as
            | PaymentTransactionAddedMessage
            | PaymentTransactionStateChangedMessage;

        return (
            message.resource.typeId === 'payment' &&
            this.isValidMessageType(message.type) &&
            this.hasExpectedMessageProperties(message) &&
            !this.isEventDisabled(this.PROCESSOR_NAME)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as
            | PaymentTransactionAddedMessage
            | PaymentTransactionStateChangedMessage;
        logger.info('Processing payment transaction state changed event');

        const payment = await this.context.ctPaymentService.getPaymentById(message.resource.id);
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

        const ctOrder = await this.context.ctOrderService.getOrderByPaymentId(message.resource.id);
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

        const body: EventRequest = this.context.orderMapper.mapCtRefundedOrderToKlaviyoEvent(
            ctOrder,
            orderProducts,
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
