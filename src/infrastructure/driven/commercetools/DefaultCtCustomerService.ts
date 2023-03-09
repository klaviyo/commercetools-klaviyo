import { Customer } from '@commercetools/platform-sdk';
import logger from '../../../utils/log';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { CtCustomerService } from "./CtCustomerService";

export type PaginatedCustomerResults = {
    data: Customer[];
    hasMore: boolean;
    lastId?: string;
};

export class DefaultCtCustomerService implements CtCustomerService{
    constructor(private readonly ctApiRoot: ByProjectKeyRequestBuilder, private readonly limit = 20) {}

    getAllCustomers = async (lastId?: string): Promise<PaginatedCustomerResults> => {
        logger.info(`Getting all customers in commercetools with id after ${lastId}`);
        try {
            const queryArgs = lastId
                ? { limit: this.limit, withTotal: false, sort: 'id asc', where: `id > "${lastId}"` }
                : { limit: this.limit, withTotal: false, sort: 'id asc' };
            const ctCustomers = (await this.ctApiRoot.customers().get({ queryArgs }).execute()).body;
            return {
                data: ctCustomers.results,
                hasMore: Boolean(ctCustomers.count === this.limit),
                lastId: ctCustomers.results.length > 0 ? ctCustomers.results[ctCustomers.results.length - 1].id : undefined,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };

    getCustomersByIdRange = async (ids: string[], lastId?: string): Promise<PaginatedCustomerResults> => {
        logger.info(`Getting all customers in commercetools with id after ${lastId}`);
        try {
            const queryArgs = lastId
                ? { limit: this.limit, withTotal: false, sort: 'id asc', where: `id in ("${ids.join('","')}") and id > "${lastId}"` }
                : { limit: this.limit, withTotal: false, sort: 'id asc', where: `id in ("${ids.join('","')}")` };
            const ctCustomers = (await this.ctApiRoot.customers().get({ queryArgs }).execute()).body;
            return {
                data: ctCustomers.results,
                hasMore: Boolean(ctCustomers.count === this.limit),
                lastId: ctCustomers.results.length > 0 ? ctCustomers.results[ctCustomers.results.length - 1].id : undefined,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };
}
