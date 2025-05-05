import logger from '../../utils/log';
import { LockService } from './services/LockService';
import { PaginatedCategoryResults } from '../../infrastructure/driven/commercetools/DefaultCtCategoryService';
import { CategoryMapper } from '../shared/mappers/CategoryMapper';
import { KlaviyoService } from '../../infrastructure/driven/klaviyo/KlaviyoService';
import { isFulfilled, isRateLimited, isRejected } from '../../utils/promise';
import { ErrorCodes } from '../../types/errors/StatusError';
import { Category } from '@commercetools/platform-sdk';
import { CtCategoryService } from '../../infrastructure/driven/commercetools/CtCategoryService';
import { GetCatalogCategoryResponseCollection } from 'klaviyo-api';
import { CategoryDeletedRequest, CategoryRequest } from '../../types/klaviyo-types';

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
                    ctCategoryResults.data.flatMap((category) => this.generateCreateCategoryRequest(category)),
                );

                const rejectedPromises = promiseResults.filter(isRejected);
                const fulfilledPromises = promiseResults.filter(isFulfilled);

                this.klaviyoService.logRateLimitHeaders(fulfilledPromises, rejectedPromises);

                await this.klaviyoService.checkRateLimitsAndDelay(promiseResults.filter(isRateLimited));

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

    public deleteAllCategories = async () => {
        logger.info('Started deletion of all categories in Klaviyo');
        try {
            //ensures that only one sync at the time is running
            await this.lockService.acquireLock(this.lockKey);

            let klaviyoCategoryResults: GetCatalogCategoryResponseCollection | undefined;
            let succeeded = 0,
                errored = 0,
                totalCategories = 0;

            do {
                klaviyoCategoryResults = await this.klaviyoService.getKlaviyoPaginatedCategories(klaviyoCategoryResults?.links?.next);

                const promiseResults = await Promise.allSettled(
                    klaviyoCategoryResults.data.flatMap((category) => this.generateDeleteCategoryRequest(category.id as string)),
                );

                const rejectedPromises = promiseResults.filter(isRejected);
                const fulfilledPromises = promiseResults.filter(isFulfilled);

                this.klaviyoService.logRateLimitHeaders(fulfilledPromises, rejectedPromises);

                await this.klaviyoService.checkRateLimitsAndDelay(promiseResults.filter(isRateLimited));

                totalCategories += klaviyoCategoryResults.data.length;
                errored += rejectedPromises.length;
                succeeded += fulfilledPromises.length;
                if (rejectedPromises.length) {
                    rejectedPromises.forEach((rejected) =>
                        logger.error('Error deleting categories in klaviyo', rejected),
                    );
                }
            } while (klaviyoCategoryResults?.links?.next);
            logger.info(
                `Klaviyo categories deletion. Total categories to be deleted ${totalCategories}, successfully deleted: ${succeeded}, errored: ${errored}`,
            );
            await this.lockService.releaseLock(this.lockKey);
        } catch (e: any) {
            if (e?.code !== ErrorCodes.LOCKED) {
                logger.error('Error while deleting all categories in Klaviyo', e);
                await this.lockService.releaseLock(this.lockKey);
            } else {
                logger.warn('Already locked');
            }
        }
    };

    private generateCreateCategoryRequest = (category: Category): Promise<any>[] => {
        const events: CategoryRequest[] = [];

        events.push(this.categoryMapper.mapCtCategoryToKlaviyoCategory(category));

        const klaviyoCategoryPromises: Promise<any>[] = events.map((e) =>
            this.klaviyoService.sendEventToKlaviyo({ type: 'categoryCreated', body: e }),
        );
        return klaviyoCategoryPromises;
    };

    private generateDeleteCategoryRequest = (categoryId: string): Promise<any>[] => {
        const events: CategoryDeletedRequest[] = [];

        events.push(this.categoryMapper.mapKlaviyoCategoryIdToDeleteCategoryRequest(categoryId));

        const klaviyoCategoryPromises: Promise<any>[] = events.map((e) =>
            this.klaviyoService.sendEventToKlaviyo({ type: 'categoryDeleted', body: e }),
        );
        return klaviyoCategoryPromises;
    }

    public async releaseLockExternally(): Promise<void> {
        await this.lockService.releaseLock(this.lockKey);
    }
}
