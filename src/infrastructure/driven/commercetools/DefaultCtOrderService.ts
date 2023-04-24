import { Order } from '@commercetools/platform-sdk';
import logger from '../../../utils/log';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { CtOrderService } from "./CtOrderService";
import { StatusError } from '../../../types/errors/StatusError';

export type PaginatedOrderResults = {
    data: Order[];
    hasMore: boolean;
    lastId?: string;
};

export class DefaultCtOrderService implements CtOrderService{
    constructor(private readonly ctApiRoot: ByProjectKeyRequestBuilder, private readonly limit = 20) {}

    getAllOrders = async (lastId?: string): Promise<PaginatedOrderResults> => {
        logger.info(`Getting all orders in commercetools with id after ${lastId}`);
        const queryArgs = lastId
            ? { limit: this.limit, withTotal: false, sort: 'id asc', where: `id > "${lastId}"` }
            : { limit: this.limit, withTotal: false, sort: 'id asc' };
        return await this.getOrders(queryArgs);
    };

    getOrdersByIdRange = async (ids: string[], lastId?: string): Promise<PaginatedOrderResults> => {
        logger.info(`Getting orders by id range in commercetools with id after ${lastId}`);
        const queryArgs = lastId
            ? { limit: this.limit, withTotal: false, sort: 'id asc', where: `id in ("${ids.join('","')}") and id > "${lastId}"` }
            : { limit: this.limit, withTotal: false, sort: 'id asc', where: `id in ("${ids.join('","')}")` };
        return await this.getOrders(queryArgs);
    };

    getOrdersByStartId = async (startId: string, lastId?: string): Promise<PaginatedOrderResults> => {
        logger.info(`Getting orders by id start id in commercetools with id ${lastId ? 'after ' + lastId : 'from ' + startId}`);
        const queryArgs = lastId
            ? { limit: this.limit, withTotal: false, sort: ['createdAt asc', 'id asc'], where: `id > "${lastId}"` }
            : { limit: this.limit, withTotal: false, sort: ['createdAt asc', 'id asc'], where: `id >= "${startId}"` };
        return await this.getOrders(queryArgs);
    };

    private getOrders = async (queryArgs: any): Promise<PaginatedOrderResults> => {
        try {
            const ctOrders = (await this.ctApiRoot.orders().get({ queryArgs }).execute()).body;
            return {
                data: ctOrders.results,
                hasMore: Boolean(ctOrders.count === this.limit),
                lastId: ctOrders.results.length > 0 ? ctOrders.results[ctOrders.results.length - 1].id : undefined,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    getOrderById = async (orderId: string): Promise<Order | undefined> => {
        logger.info(`Getting order ${orderId} in commercetools`);
        let ctOrder: Order;

        try {
            ctOrder = (await this.ctApiRoot.orders().withId({ ID: orderId }).get().execute()).body;
        } catch (error) {
            logger.error(error);
            return undefined;
        }

        return ctOrder;
    };

    getOrderByPaymentId = async (paymentId: string): Promise<Order> => {
        logger.info(`Getting order with payment ${paymentId} in commercetools`);

        try {
            const orderResults = (await this.ctApiRoot.orders().get({
                queryArgs: {
                    limit: 1,
                    where: `paymentInfo(payments(id = "${paymentId}"))`,
                    expand: 'paymentInfo.payments[*]',
                },
            }).execute()).body?.results;
            if (!orderResults?.length) {
                throw new StatusError(
                    404,
                    `No results returned when querying orders with payment ID ${paymentId}`,
                );
            }
            return orderResults[0];
        } catch (error: any) {
            logger.error(`Error getting order in CT with payment id ${paymentId}, status: ${error.status || error.statusCode}`, error);
            throw new StatusError(
                error.statusCode,
                `CT get order by payment id api returns failed with status code ${error.status || error.statusCode}, msg: ${error.message}`,
            );
        }
    };

}
