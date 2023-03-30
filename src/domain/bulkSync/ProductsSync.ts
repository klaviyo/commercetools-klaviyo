import logger from '../../utils/log';
import { LockService } from './services/LockService';
import { PaginatedProductResults } from '../../infrastructure/driven/commercetools/DefaultCtProductService';
import { ProductMapper } from '../shared/mappers/ProductMapper';
import { KlaviyoService } from '../../infrastructure/driven/klaviyo/KlaviyoService';
import { isFulfilled, isRejected, isRateLimited } from '../../utils/promise';
import { ErrorCodes } from '../../types/errors/StatusError';
import { Product } from '@commercetools/platform-sdk';
import { CtProductService } from '../../infrastructure/driven/commercetools/CtProductService';
import { getElapsedSeconds, startTime } from '../../utils/time-utils';
import e from 'express';

export class ProductsSync {
    lockKey = 'productFullSync';
    constructor(
        private readonly lockService: LockService,
        private readonly productMapper: ProductMapper,
        private readonly klaviyoService: KlaviyoService,
        private readonly ctProductService: CtProductService,
    ) {}

    public syncAllProducts = async () => {
        logger.info('Started sync of all historical products');
        try {
            //ensures that only one sync at the time is running
            await this.lockService.acquireLock(this.lockKey);

            let ctProductsResult: PaginatedProductResults | undefined;
            let succeeded = 0,
                errored = 0,
                totalProducts = 0,
                totalVariants = 0,
                totalKlaviyoEvents = 0;
            const _startTime = startTime();

            do {
                let importedElements = 0, failedElements = 0;
                ctProductsResult = await this.ctProductService.getAllProducts(ctProductsResult?.lastId);

                const productPromiseResults = await this.generateProductsJobRequestForKlaviyo(ctProductsResult.data);
                importedElements += parseInt(productPromiseResults.body?.data.attributes.completed_count || 0);
                failedElements += parseInt(productPromiseResults.body?.data.attributes.failed_count || 0);

                await this.klaviyoService.checkRateLimitsAndDelay([productPromiseResults].filter(isRateLimited));
                
                const variantPromiseResults = await Promise.allSettled(
                    ctProductsResult.data.flatMap((product: Product) =>
                        this.generateProductVariantsJobRequestForKlaviyo(product),
                    ),
                );
                variantPromiseResults.forEach((p: any) => {
                    importedElements += parseInt(p.value?.body?.data.attributes.completed_count || 0);
                    failedElements += parseInt(p.value?.body?.data.attributes.failed_count || 0);
                })

                await this.klaviyoService.checkRateLimitsAndDelay(variantPromiseResults.filter(isRateLimited));

                const promiseResults = [productPromiseResults].concat(variantPromiseResults);

                const rejectedPromises = promiseResults.filter(p => isRejected(p) && !isRateLimited(p));
                const fulfilledPromises = promiseResults.filter(isFulfilled);

                this.klaviyoService.logRateLimitHeaders(fulfilledPromises, rejectedPromises);

                totalProducts += ctProductsResult.data.length;
                totalVariants += ctProductsResult.data.flatMap(p => p.masterData.current?.variants || []).length;
                totalKlaviyoEvents += promiseResults.length;
                errored += (rejectedPromises.length + failedElements);
                succeeded += (importedElements);
                if (rejectedPromises.length) {
                    rejectedPromises.forEach((rejected: any) =>
                        logger.error('Error syncing event with klaviyo', rejected),
                    );
                }
            } while (ctProductsResult.hasMore);
            logger.info(
                `Historical products import. Total products to be imported ${totalProducts}, total variants ${totalVariants}, total klaviyo events: ${totalKlaviyoEvents}, successfully imported: ${succeeded}, errored: ${errored}, elapsed time: ${getElapsedSeconds(
                    _startTime,
                )} seconds`,
            );
            await this.lockService.releaseLock(this.lockKey);
        } catch (e: any) {
            if (e?.code !== ErrorCodes.LOCKED) {
                logger.error('Error while syncing all historical products', e);
                await this.lockService.releaseLock(this.lockKey);
            } else {
                logger.warn('Already locked');
            }
        }
    };

    private generateProductsJobRequestForKlaviyo = (products: Product[]): Promise<any> => {
        return this.klaviyoService.sendJobRequestToKlaviyo({
            type: 'itemCreated',
            body: this.productMapper.mapCtProductsToKlaviyoItemJob(products),
        });
    };

    private generateProductVariantsJobRequestForKlaviyo = (product: Product): Promise<any> | undefined => {
        if (product.masterData.current) {
            return this.klaviyoService.sendJobRequestToKlaviyo({
                type: 'variantCreated',
                body: this.productMapper.mapCtProductVariantsToKlaviyoVariantsJob(product),
            });
        }
    };

    public async releaseLockExternally(): Promise<void> {
        await this.lockService.releaseLock(this.lockKey);
    }
}
