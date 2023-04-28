import { Category } from '@commercetools/platform-sdk';
import { CtCategoryService } from './CtCategoryService';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import logger from '../../../utils/log';
import { StatusError } from '../../../types/errors/StatusError';

export type PaginatedCategoryResults = {
    data: Category[];
    hasMore: boolean;
    lastId?: string;
};

export class DefaultCtCategoryService implements CtCategoryService {
    constructor(private readonly ctApiRoot: ByProjectKeyRequestBuilder, private readonly limit = 20) {}

    getAllCategories = async (lastId?: string): Promise<PaginatedCategoryResults> => {
        logger.info(`Getting all categories in commercetools with id after ${lastId}`);
        try {
            const queryArgs = lastId
                ? { limit: this.limit, withTotal: false, sort: 'id asc', expand: 'ancestors[*]', where: `id > "${lastId}"` }
                : { limit: this.limit, withTotal: false, sort: 'id asc', expand: 'ancestors[*]' };
            const ctCategories = (await this.ctApiRoot.categories().get({ queryArgs }).execute()).body;
            return {
                data: ctCategories.results,
                hasMore: Boolean(ctCategories.count === this.limit),
                lastId: ctCategories.results.length > 0 ? ctCategories.results[ctCategories.results.length - 1].id : undefined,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };

    getCategoryById = async (categoryId: string): Promise<Category> => {
        logger.info(`Getting category in commercetools with id ${categoryId}`);

        try {
            return (await this.ctApiRoot.categories().withId({ ID: categoryId }).get({
                queryArgs: {
                    expand: 'ancestors[*]',
                },
            }).execute()).body;
        } catch (error: any) {
            logger.error(`Error getting category in CT with id ${categoryId}, status: ${error.statusCode}`, error);
            throw new StatusError(
                error.statusCode,
                `CT get category api returns failed with status code ${error.statusCode}, msg: ${error.message}`,
            );
        }
    };
}
