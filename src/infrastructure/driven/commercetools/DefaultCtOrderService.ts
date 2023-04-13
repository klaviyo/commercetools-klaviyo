import { Order } from '@commercetools/platform-sdk';
import logger from '../../../utils/log';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { CtOrderService } from "./CtOrderService";

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
            ? { limit: this.limit, withTotal: false, sort: 'id asc', where: `id > "${lastId}"` }
            : { limit: this.limit, withTotal: false, sort: 'id asc', where: `id >= "${startId}"` };
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
}
