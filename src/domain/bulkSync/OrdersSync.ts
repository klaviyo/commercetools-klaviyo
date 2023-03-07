import logger from '../../utils/log';
import { LockService } from './services/LockService';
import { PaginatedOrderResults } from '../../infrastructure/driven/commercetools/DefaultCtOrderService';
import { OrderMapper } from '../shared/mappers/OrderMapper';
import { KlaviyoService } from '../../infrastructure/driven/klaviyo/KlaviyoService';
import config from 'config';
import { isFulfilled, isRejected } from '../../utils/promise';
import { ErrorCodes } from '../../types/errors/StatusError';
import { isOrderCancelled, isOrderFulfilled } from '../../utils/order-utils';
import { Order } from '@commercetools/platform-sdk';
import { CtOrderService } from '../../infrastructure/driven/commercetools/CtOrderService';
import { getElapsedSeconds, startTime } from '../../utils/time-utils';

export class OrdersSync {
    constructor(
        private readonly lockService: LockService,
        private readonly orderMapper: OrderMapper,
        private readonly klaviyoService: KlaviyoService,
        private readonly ctOrderService: CtOrderService,
    ) {}

    public syncAllOrders = async () => {
        logger.info('Started sync of all historical orders');
        const lockKey = 'orderFullSync';
        try {
            //ensures that only one sync at the time is running
            await this.lockService.acquireLock(lockKey);

            let ctOrdersResult: PaginatedOrderResults | undefined;
            let succeeded = 0,
                errored = 0,
                totalOrders = 0,
                totalKlaviyoEvents = 0;
            const _startTime = startTime();

            do {
                ctOrdersResult = await this.ctOrderService.getAllOrders(ctOrdersResult?.lastId);

                const promiseResults = await Promise.allSettled(
                    ctOrdersResult.data.flatMap((order) => this.generateAndSendOrderEventsToKlaviyo(order)),
                );

                const rejectedPromises = promiseResults.filter(isRejected);
                const fulfilledPromises = promiseResults.filter(isFulfilled);

                this.klaviyoService.logRateLimitHeaders(fulfilledPromises, rejectedPromises);

                totalOrders += ctOrdersResult.data.length;
                totalKlaviyoEvents += promiseResults.length;
                errored += rejectedPromises.length;
                succeeded += fulfilledPromises.length;
                if (rejectedPromises.length) {
                    rejectedPromises.forEach((rejected) => logger.error('Error syncing event with klaviyo', rejected));
                }
            } while (ctOrdersResult.hasMore);
            logger.info(
                `Historical orders import. Total orders to be imported ${totalOrders}, total klaviyo events: ${totalKlaviyoEvents}, successfully imported: ${succeeded}, errored: ${errored}, elapsed time: ${getElapsedSeconds(
                    _startTime,
                )} seconds`,
            );
            await this.lockService.releaseLock(lockKey);
        } catch (e: any) {
            if (e?.code !== ErrorCodes.LOCKED) {
                logger.error('Error while syncing all historical orders', e);
                await this.lockService.releaseLock(lockKey);
            } else {
                logger.warn('Already locked');
            }
        }
    };

    private generateAndSendOrderEventsToKlaviyo = (order: Order): Promise<any>[] => {
        const events: EventRequest[] = [];

        //Order placed event
        events.push(this.orderMapper.mapCtOrderToKlaviyoEvent(order, config.get('order.metrics.placedOrder')));

        //Ordered product event
        const eventTime: Date = new Date(order.createdAt);
        order.lineItems.forEach((line) => {
            eventTime.setSeconds(eventTime.getSeconds() + 1);
            events.push(this.orderMapper.mapOrderLineToProductOrderedEvent(line, order, eventTime.toISOString()));
        });

        //Order fulfilled event
        if (isOrderFulfilled(order)) {
            eventTime.setSeconds(eventTime.getSeconds() + 1);
            events.push(
                this.orderMapper.mapCtOrderToKlaviyoEvent(
                    order,
                    config.get('order.metrics.fulfilledOrder'),
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
                    config.get('order.metrics.cancelledOrder'),
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
}
