import logger from '../../../utils/log';

export abstract class KlaviyoService {
    abstract sendEventToKlaviyo(event: KlaviyoEvent): Promise<any>;

    abstract sendJobRequestToKlaviyo(event: KlaviyoEvent): Promise<any>;

    abstract getKlaviyoProfileByExternalId(externalId: string): Promise<ProfileType | undefined>;

    public logRateLimitHeaders(
        fulfilledPromises?: PromiseFulfilledResult<any>[],
        rejectedPromises?: PromiseRejectedResult[],
    ): void {
        fulfilledPromises?.forEach((response) => {
            const limit = response?.value?.headers ? response?.value?.headers['ratelimit-limit'] : undefined;
            const remaining = response?.value?.headers ? response?.value?.headers['ratelimit-remaining'] : undefined;
            const reset = response?.value?.headers ? response?.value?.headers['ratelimit-reset'] : undefined;
            logger.debug(
                `Fulfilled promise rate limit values. Limit ${limit} - Remaining ${remaining} - Reset: ${reset}`,
                {
                    limit,
                    remaining,
                    reset,
                },
            );
        });
        rejectedPromises?.forEach((error) => {
            const limit = error?.reason?.response?.headers ? error?.reason?.response?.headers['ratelimit-limit'] : undefined;
            const remaining = error?.reason?.response?.headers ? error?.reason?.response?.headers['ratelimit-remaining'] : undefined;
            const reset = error?.reason?.response?.headers ? error?.reason?.response?.headers['ratelimit-reset'] : undefined;
            logger.debug(
                `Rejected promise rate limit values. Limit ${limit} - Remaining ${remaining} - Reset: ${reset}`,
                {
                    limit,
                    remaining,
                    reset,
                },
            );
        });
    }

    public async checkRateLimitsAndDelay(rateLimitedPromises?: PromiseRejectedResult[], extraTime = 10): Promise<void> {
        return new Promise((resolve) => {
            const retryAfter: number = parseInt(rateLimitedPromises?.find(
                (promise) => promise?.reason?.response?.headers['retry-after'] !== undefined,
            )?.reason.response.headers['retry-after'] || 0);
            if (retryAfter) {
                logger.info(`Klaviyo rate limit reached, pausing for ${(retryAfter + 10)} seconds to complete pending requests`);
                setTimeout(resolve, (retryAfter + extraTime) * 1000);
            } else {
                resolve();
            }
        });
    }

    abstract getKlaviyoCategoryByExternalId(externalId: string): Promise<CategoryType | undefined>;

    abstract getKlaviyoItemsByIds (ids: string[], fieldsCatalogItem?: string[]): Promise<ItemType[]>;

    abstract getKlaviyoItemVariantsByCtSkus (productId?: string, skus?: string[], fieldsCatalogVariant?: string[]): Promise<ItemVariantType[]>;
}
