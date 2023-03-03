import logger from "../../../utils/log";

export abstract class KlaviyoService {
    abstract sendEventToKlaviyo(event: KlaviyoEvent): Promise<any>;

    abstract getKlaviyoProfileByExternalId (externalId: string): Promise<ProfileType | undefined>;

    public logRateLimitHeaders(fulfilledPromises?: PromiseFulfilledResult<any>[], rejectedPromises?: PromiseRejectedResult[]): void {
        fulfilledPromises?.forEach(response => {
            const limit = response?.value?.headers["ratelimit-limit"]
            const remaining = response?.value.headers["ratelimit-remaining"]
            const reset = response?.value.headers["ratelimit-reset"]
            logger.debug(`Fulfillled promise rate limit values. Limit ${limit} - Remaining ${remaining} - Reset: ${reset}`, {
                limit,
                remaining,
                reset,
            });
        })
        rejectedPromises?.forEach(error => {
            const limit = error?.reason?.response?.headers["ratelimit-limit"]
            const remaining = error?.reason?.response?.headers["ratelimit-remaining"]
            const reset = error?.reason?.response?.headers["ratelimit-reset"]
            logger.debug(`Rejected promise rate limit values. Limit ${limit} - Remaining ${remaining} - Reset: ${reset}`, {
                limit,
                remaining,
                reset,
            });
        })
    }
}
