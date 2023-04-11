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
import { groupIntoMaxSizeJobs } from '../../utils/job-grouper';

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
            let importedElements = 0,
                failedElements = 0;
            let itemJobRequests: KlaviyoEvent[] = [];
            let variantJobRequests: KlaviyoEvent[] = [];
            let promiseResults;

            do {
                ctProductsResult = await this.ctProductService.getAllProducts(ctProductsResult?.lastId);

                itemJobRequests = itemJobRequests.concat(
                    await this.generateProductsJobRequestForKlaviyo(ctProductsResult.data),
                );

                variantJobRequests = variantJobRequests.concat(
                    (
                        await Promise.all(
                            ctProductsResult.data
                                .filter((product) => product.masterData.current)
                                .flatMap(
                                    async (product: Product) =>
                                        await this.generateProductVariantsJobRequestForKlaviyo(product),
                                ),
                        )
                    ).flat(),
                );

                totalProducts += ctProductsResult.data.length;
                totalVariants += ctProductsResult.data.flatMap((p) =>
                    (p.masterData.current?.variants || []).concat(
                        p.masterData.current?.masterVariant ? [p.masterData.current?.masterVariant] : [],
                    ),
                ).length;
            } while (ctProductsResult.hasMore);

            const itemEvents = groupIntoMaxSizeJobs(itemJobRequests, ['itemCreated', 'itemUpdated'], 'items');

            const variantEvents = groupIntoMaxSizeJobs(
                variantJobRequests,
                ['variantDeleted', 'variantCreated', 'variantUpdated'],
                'variants',
            );

            const productPromiseResults = (
                await Promise.allSettled(
                    itemEvents.itemUpdated
                        .concat(itemEvents.itemCreated)
                        .map(async (r) => await this.klaviyoService.sendJobRequestToKlaviyo(r)),
                )
            ).flat();

            productPromiseResults.forEach((p: any) => {
                importedElements += parseInt(p.value?.body?.data.attributes.completed_count || 0);
                failedElements += parseInt(p.value?.body?.data.attributes.failed_count || 0);
            });

            await this.klaviyoService.checkRateLimitsAndDelay(productPromiseResults.filter(isRateLimited));

            const deleteVariantPromiseResults = (
                await Promise.allSettled(
                    variantEvents.variantDeleted.map(
                        async (r: KlaviyoEvent) => await this.klaviyoService.sendJobRequestToKlaviyo(r),
                    ),
                )
            ).flat();

            await this.klaviyoService.checkRateLimitsAndDelay(deleteVariantPromiseResults.filter(isRateLimited));

            promiseResults = productPromiseResults.concat(deleteVariantPromiseResults);

            const variantPromiseResults = (
                await Promise.allSettled(
                    variantEvents.variantUpdated
                        .concat(variantEvents.variantCreated)
                        .map(async (r: KlaviyoEvent) => await this.klaviyoService.sendJobRequestToKlaviyo(r)),
                )
            ).flat();

            variantPromiseResults.forEach((p: any) => {
                importedElements += parseInt(p.value?.body?.data.attributes.completed_count || 0);
                failedElements += parseInt(p.value?.body?.data.attributes.failed_count || 0);
            });

            await this.klaviyoService.checkRateLimitsAndDelay(variantPromiseResults.filter(isRateLimited));

            promiseResults = promiseResults.concat(variantPromiseResults);

            const rejectedPromises = promiseResults.filter((p) => isRejected(p) && !isRateLimited(p));
            const fulfilledPromises = promiseResults.filter(isFulfilled);

            this.klaviyoService.logRateLimitHeaders(fulfilledPromises, rejectedPromises as any);

            totalKlaviyoEvents += promiseResults.length;
            errored += rejectedPromises.length + failedElements;
            succeeded += importedElements;
            if (rejectedPromises.length) {
                rejectedPromises.forEach((rejected: any) => logger.error('Error syncing event with klaviyo', rejected));
            }
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

    private generateProductsJobRequestForKlaviyo = async (products: Product[]): Promise<KlaviyoEvent[]> => {
        const ctPublishedProducts = products.filter((p) => p.masterData.current);
        const klaviyoItems = (await this.klaviyoService.getKlaviyoItemsByIds(ctPublishedProducts.map((p) => p.id))).map(
            (i) => i.id,
        );
        const productsForCreation = ctPublishedProducts.filter(
            (p) => !klaviyoItems.includes(`$custom:::$default:::${p.id}`),
        );
        const productsForUpdate = ctPublishedProducts.filter((p) =>
            klaviyoItems.includes(`$custom:::$default:::${p.id}`),
        );
        const promises: KlaviyoEvent[] = [];
        if (productsForCreation.length) {
            promises.push({
                type: 'itemCreated',
                body: this.productMapper.mapCtProductsToKlaviyoItemJob(productsForCreation, 'itemCreated'),
            });
        }
        if (productsForUpdate.length) {
            promises.push({
                type: 'itemUpdated',
                body: this.productMapper.mapCtProductsToKlaviyoItemJob(productsForUpdate, 'itemUpdated'),
            });
        }
        return promises;
    };

    private generateProductVariantsJobRequestForKlaviyo = async (product: Product): Promise<KlaviyoEvent[]> => {
        const combinedVariants = [product.masterData.current.masterVariant]
            .concat(product.masterData.current.variants);
        const ctProductVariants = combinedVariants
            .map((v) => v.sku || '')
            .filter((v) => v)
            .map((v) => `$custom:::$default:::${v}`);
        const klaviyoVariants = (
            await this.klaviyoService.getKlaviyoItemVariantsByCtSkus(product.id, undefined, ['id'])
        ).map((i) => i.id);
        const variantsForCreation = combinedVariants.filter(
            (v) => !klaviyoVariants.includes(`$custom:::$default:::${v.sku}`),
        );
        const variantsForUpdate = combinedVariants.filter((v) =>
            klaviyoVariants.includes(`$custom:::$default:::${v.sku}`),
        );
        const variantsForDeletion = klaviyoVariants.filter((v) => v && !ctProductVariants.includes(v));
        const promises: KlaviyoEvent[] = [];
        if (variantsForDeletion.length) {
            promises.push({
                type: 'variantDeleted',
                body: this.productMapper.mapCtProductVariantsToKlaviyoVariantsJob(
                    product,
                    variantsForDeletion as string[],
                    'variantDeleted',
                ),
            });
        }
        if (variantsForCreation.length) {
            promises.push({
                type: 'variantCreated',
                body: this.productMapper.mapCtProductVariantsToKlaviyoVariantsJob(
                    product,
                    variantsForCreation,
                    'variantCreated',
                ),
            });
        }
        if (variantsForUpdate.length) {
            promises.push({
                type: 'variantUpdated',
                body: this.productMapper.mapCtProductVariantsToKlaviyoVariantsJob(
                    product,
                    variantsForUpdate,
                    'variantUpdated',
                ),
            });
        }
        return promises;
    };

    public async releaseLockExternally(): Promise<void> {
        await this.lockService.releaseLock(this.lockKey);
    }
}
