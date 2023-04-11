import { Product } from '@commercetools/platform-sdk';
import logger from '../../../utils/log';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { CtProductService } from './CtProductService';

export type PaginatedProductResults = {
    data: Product[];
    hasMore: boolean;
    lastId?: string;
};

export class DefaultCtProductService implements CtProductService {
    constructor(private readonly ctApiRoot: ByProjectKeyRequestBuilder, private readonly limit = 20) {}

    getAllProducts = async (lastId?: string): Promise<PaginatedProductResults> => {
        logger.info(`Getting all products in commercetools with id after ${lastId}`);
        try {
            const queryArgs = lastId
                ? { limit: this.limit, withTotal: false, sort: 'id asc', where: `masterData(published = true) and id > "${lastId}"` }
                : { limit: this.limit, withTotal: false, sort: 'id asc', where: 'masterData(published = true)' };
            const ctProducts = (await this.ctApiRoot.products().get({ queryArgs }).execute()).body;
            return {
                data: ctProducts.results,
                hasMore: Boolean(ctProducts.count === this.limit),
                lastId:
                    ctProducts.results.length > 0 ? ctProducts.results[ctProducts.results.length - 1].id : undefined,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };
}
