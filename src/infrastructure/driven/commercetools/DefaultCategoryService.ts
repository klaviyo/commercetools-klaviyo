import { Category } from '@commercetools/platform-sdk';
import { CtCategoryService } from './CtCategoryService';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import logger from '../../../utils/log';
import { StatusError } from '../../../types/errors/StatusError';

export class DefaultCtCategoryService implements CtCategoryService {
    constructor(private readonly ctApiRoot: ByProjectKeyRequestBuilder, private readonly limit = 20) {}

    getCategoryById = async (categoryId: string): Promise<Category> => {
        logger.info(`Getting category in commercetools with id ${categoryId}`);

        try {
            return (await this.ctApiRoot.categories().withId({ ID: categoryId }).get().execute()).body;
        } catch (error: any) {
            logger.error(`Error getting category in CT with id ${categoryId}, status: ${error.statusCode}`, error);
            throw new StatusError(
                error.statusCode,
                `CT get category api returns failed with status code ${error.statusCode}, msg: ${error.message}`,
            );
        }
    };
}
