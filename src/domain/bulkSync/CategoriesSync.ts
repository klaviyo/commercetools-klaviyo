import logger from '../../utils/log';
import { LockService } from './services/LockService';
import { PaginatedCategoryResults } from '../../infrastructure/driven/commercetools/DefaultCtCategoryService';
import { CategoryMapper } from '../shared/mappers/CategoryMapper';
import { KlaviyoService } from '../../infrastructure/driven/klaviyo/KlaviyoService';
import { isFulfilled, isRejected } from '../../utils/promise';
import { ErrorCodes } from '../../types/errors/StatusError';
import { Category } from '@commercetools/platform-sdk';
import { CtCategoryService } from '../../infrastructure/driven/commercetools/CtCategoryService';

export class CategoriesSync {
    lockKey = 'categoryFullSync';
    constructor(
        private readonly lockService: LockService,
        private readonly categoryMapper: CategoryMapper,
        private readonly klaviyoService: KlaviyoService,
        private readonly ctCategoryService: CtCategoryService,
    ) {}

    public syncAllCategories = async () => {
        logger.info('Started sync of all historical categories');
        try {
            //ensures that only one sync at the time is running
            await this.lockService.acquireLock(this.lockKey);

            let ctCategoryResults: PaginatedCategoryResults | undefined;
            let succeeded = 0,
                errored = 0,
                totalCategories = 0,
                totalKlaviyoCategories = 0;

            do {
                ctCategoryResults = await this.ctCategoryService.getAllCategories(ctCategoryResults?.lastId);

                const promiseResults = await Promise.allSettled(
                    ctCategoryResults.data.flatMap((category) => this.generateCategories(category)),
                );

                const rejectedPromises = promiseResults.filter(isRejected);
                const fulfilledPromises = promiseResults.filter(isFulfilled);

                this.klaviyoService.logRateLimitHeaders(fulfilledPromises, rejectedPromises);

                totalCategories += ctCategoryResults.data.length;
                totalKlaviyoCategories += promiseResults.length;
                errored += rejectedPromises.length;
                succeeded += fulfilledPromises.length;
                if (rejectedPromises.length) {
                    rejectedPromises.forEach((rejected) =>
                        logger.error('Error syncing categories with klaviyo', rejected),
                    );
                }
            } while (ctCategoryResults.hasMore);
            logger.info(
                `Historical categories import. Total categories to be imported ${totalCategories}, total klaviyo categories: ${totalKlaviyoCategories}, successfully imported: ${succeeded}, errored: ${errored}`,
            );
            await this.lockService.releaseLock(this.lockKey);
        } catch (e: any) {
            if (e?.code !== ErrorCodes.LOCKED) {
                logger.error('Error while syncing all historical categories', e);
                await this.lockService.releaseLock(this.lockKey);
            } else {
                logger.warn('Already locked');
            }
        }
    };

    private generateCategories = (category: Category): Promise<any>[] => {
        const events: CategoryRequest[] = [];

        events.push(this.categoryMapper.mapCtCategoryToKlaviyoCategory(category));

        const klaviyoCategoryPromises: Promise<any>[] = events.map((e) =>
            this.klaviyoService.sendEventToKlaviyo({ type: 'categoryCreated', body: e }),
        );
        return klaviyoCategoryPromises;
    };

    public async releaseLockExternally(): Promise<void> {
        await this.lockService.releaseLock(this.lockKey);
    }
}
