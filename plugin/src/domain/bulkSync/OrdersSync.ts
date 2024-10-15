import logger from '../../utils/log';
import { LockService } from './services/LockService';
import { PaginatedOrderResults } from '../../infrastructure/driven/commercetools/DefaultCtOrderService';
import { OrderMapper } from '../shared/mappers/OrderMapper';
import { KlaviyoService } from '../../infrastructure/driven/klaviyo/KlaviyoService';
import config from 'config';
import { isFulfilled, isRejected } from '../../utils/promise';
import { ErrorCodes } from '../../types/errors/StatusError';
import { isOrderCancelled, isOrderFulfilled } from '../../utils/order-utils';
import { Order, Product } from '@commercetools/platform-sdk';
import { CtOrderService } from '../../infrastructure/driven/commercetools/CtOrderService';
import { getElapsedSeconds, startTime } from '../../utils/time-utils';
import { CtProductService } from '../../infrastructure/driven/commercetools/CtProductService';
import { PaginatedProductResults } from '../../infrastructure/driven/commercetools/DefaultCtProductService';

export class OrdersSync {
    lockKey = 'orderFullSync';
    constructor(
        private readonly lockService: LockService,
        private readonly orderMapper: OrderMapper,
        private readonly klaviyoService: KlaviyoService,
        private readonly ctOrderService: CtOrderService,
        private readonly ctProductService: CtProductService,
    ) {}

    public syncAllOrders = async () => {
        logger.info('Started sync of all historical orders');
        await this.syncOrders(this.ctOrderService.getAllOrders, '', []);
    };

    public syncOrdersByIdRange = async (orderIds: string[]) => {
        logger.info('Started sync of historical orders by id range');
        await this.syncOrders(this.ctOrderService.getOrdersByIdRange, ' by id range', [orderIds]);
    };

    public syncOrdersByStartId = async (startId: string) => {
        logger.info('Started sync of historical orders using id as starting point');
        await this.syncOrders(this.ctOrderService.getOrdersByStartId, ' by start id', [startId]);
    };

    private syncOrders = async (ordersMethod: any, importTypeText: string, args: unknown[]) => {
        try {
            //ensures that only one sync at the time is running
            this.lockService.acquireLock(this.lockKey);

            let ctOrdersResult: PaginatedOrderResults | undefined;
            let ctProductsByOrder: any = {};
            let succeeded = 0,
                errored = 0,
                totalOrders = 0,
                totalKlaviyoEvents = 0;
            const _startTime = startTime();

            do {
                ctOrdersResult = await ordersMethod(...args, ctOrdersResult?.lastId);

                // Used to set Categories for Order properties in Klaviyo
                ctProductsByOrder = {};
                for (const order of (ctOrdersResult as PaginatedOrderResults).data) {
                    ctProductsByOrder[order.id] = [];
                    let ctProductsResult: PaginatedProductResults | undefined;
                    do {
                        try {
                            ctProductsResult = await this.ctProductService.getProductsByIdRange(
                                order.lineItems.map((item) => item.productId),
                                ctProductsResult?.lastId,
                            );
                            ctProductsByOrder[order.id] = ctProductsByOrder[order.id].concat(ctProductsResult.data);
                        } catch (err) {
                            logger.info(`Failed to get product details for order: ${order.id}`);
                        }
                    } while (ctProductsResult?.hasMore);
                }

                const promiseResults = await Promise.allSettled(
                    (ctOrdersResult as PaginatedOrderResults).data.flatMap((order) =>
                        this.generateAndSendOrderEventsToKlaviyo(order, ctProductsByOrder[order.id]),
                    ),
                );

                const rejectedPromises = promiseResults.filter(isRejected);
                const fulfilledPromises = promiseResults.filter(isFulfilled);

                this.klaviyoService.logRateLimitHeaders(fulfilledPromises, rejectedPromises);

                totalOrders += (ctOrdersResult as PaginatedOrderResults).data.length;
                totalKlaviyoEvents += promiseResults.length;
                errored += rejectedPromises.length;
                succeeded += fulfilledPromises.length;
                if (rejectedPromises.length) {
                    rejectedPromises.forEach((rejected) => logger.error('Error syncing event with klaviyo', rejected));
                }
            } while ((ctOrdersResult as PaginatedOrderResults).hasMore);
            logger.info(
                `Historical orders import${importTypeText}. Total orders to be imported ${totalOrders}, total klaviyo events: ${totalKlaviyoEvents}, successfully imported: ${succeeded}, errored: ${errored}, elapsed time: ${getElapsedSeconds(
                    _startTime,
                )} seconds`,
            );
            this.lockService.releaseLock(this.lockKey);
        } catch (e: any) {
            if (e?.code !== ErrorCodes.LOCKED) {
                logger.error('Error while syncing historical orders${importTypeText}', e);
                this.lockService.releaseLock(this.lockKey);
                return;
            }
            logger.warn('Already locked');
        }
    };

    private generateAndSendOrderEventsToKlaviyo = (order: Order, orderProducts: Product[]): Promise<any>[] => {
        const events: EventRequest[] = [];

        //Order placed event
        events.push(
            this.orderMapper.mapCtOrderToKlaviyoEvent(order, orderProducts, config.get('order.metrics.placedOrder'), false),
        );

        //Ordered product event
        const eventTime: Date = new Date(order.createdAt);
        order.lineItems.forEach((line) => {
            eventTime.setSeconds(eventTime.getSeconds() + 1);
            events.push(this.orderMapper.mapOrderLineToProductOrderedEvent(line, order, orderProducts, eventTime.toISOString()));
        });

        //Order fulfilled event
        if (isOrderFulfilled(order)) {
            eventTime.setSeconds(eventTime.getSeconds() + 1);
            events.push(
                this.orderMapper.mapCtOrderToKlaviyoEvent(
                    order,
                    orderProducts,
                    config.get('order.metrics.fulfilledOrder'),
                    false,
                    eventTime.toISOString(),
                ),
            );
        }

        //Order cancelled event
        if (isOrderCancelled(order)) {
            eventTime.setSeconds(eventTime.getSeconds() + 1);
            events.push(
                this.orderMapper.mapCtOrderToKlaviyoEvent(
                    order,
                    orderProducts,
                    config.get('order.metrics.cancelledOrder'),
                    false,
                    eventTime.toISOString(),
                ),
            );
        }

        const klaviyoEventPromises: Promise<any>[] = [];
        events.forEach((e) =>
            klaviyoEventPromises.push(this.klaviyoService.sendEventToKlaviyo({ type: 'event', body: e })),
        );
        return klaviyoEventPromises;
    };

    public async releaseLockExternally(): Promise<void> {
        this.lockService.releaseLock(this.lockKey);
    }
}
