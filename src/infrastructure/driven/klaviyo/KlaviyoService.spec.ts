import { KlaviyoService } from './KlaviyoService';
import logger from '../../../utils/log';
import { mock } from 'jest-mock-extended';

jest.mock('../../../utils/log', () => {
    return {
        debug: jest.fn(),
        info: jest.fn(),
    };
});

describe('Klaviyo abstract service', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    class DummyKlaviyoService extends KlaviyoService {
        getKlaviyoProfileByExternalId(externalId: string): Promise<ProfileType | undefined> {
            return Promise.resolve(undefined);
        }

        sendEventToKlaviyo(event: KlaviyoEvent): Promise<any> {
            return Promise.resolve(undefined);
        }

        getKlaviyoCategoryByExternalId(externalId: string): Promise<CategoryType | undefined> {
            return Promise.resolve(undefined);
        }

        sendJobRequestToKlaviyo(event: KlaviyoEvent): Promise<any> {
            return Promise.resolve(undefined);
        }

        getKlaviyoItemsByIds (ids: string[], fieldsCatalogItem?: string[]): Promise<ItemType[]> {
            return Promise.resolve(mock<ItemType[]>());
        }

        getKlaviyoVariantsByCtSkus (skus: string[], fieldsCatalogVariant?: string[]): Promise<ItemVariantType[]> {
            return Promise.resolve(mock<ItemVariantType[]>());
        }
    }

    test('should log all the rateLimit headers when they are available', async () => {
        const klaviyoService = new DummyKlaviyoService();
        const fulfilledResults: PromiseFulfilledResult<any>[] = [
            {
                status: 'fulfilled',
                value: {
                    headers: {
                        'ratelimit-limit': '1',
                        'ratelimit-remaining': '2',
                        'ratelimit-reset': '3',
                    },
                },
            },
            {
                status: 'fulfilled',
                value: {
                    headers: {
                        'ratelimit-limit': '4',
                        'ratelimit-remaining': '5',
                        'ratelimit-reset': '6',
                    },
                },
            },
        ];
        const rejectedResults: PromiseRejectedResult[] = [
            {
                status: 'rejected',
                reason: {
                    response: {
                        headers: {
                            'ratelimit-limit': '7',
                            'ratelimit-remaining': '8',
                            'ratelimit-reset': '9',
                        },
                    },
                },
            },
            {
                status: 'rejected',
                reason: {
                    response: {
                        headers: {
                            'ratelimit-limit': '10',
                            'ratelimit-remaining': '11',
                            'ratelimit-reset': '12',
                        },
                    },
                },
            },
        ];
        klaviyoService.logRateLimitHeaders(fulfilledResults, rejectedResults);
        expect(jest.isMockFunction(logger.debug)).toBeTruthy();
        expect(logger.debug).toBeCalledTimes(4);
        expect(logger.debug).toHaveBeenNthCalledWith(
            1,
            'Fulfilled promise rate limit values. Limit 1 - Remaining 2 - Reset: 3',
            {
                limit: '1',
                remaining: '2',
                reset: '3',
            },
        );
        expect(logger.debug).toHaveBeenNthCalledWith(
            2,
            'Fulfilled promise rate limit values. Limit 4 - Remaining 5 - Reset: 6',
            {
                limit: '4',
                remaining: '5',
                reset: '6',
            },
        );
        expect(logger.debug).toHaveBeenNthCalledWith(
            3,
            'Rejected promise rate limit values. Limit 7 - Remaining 8 - Reset: 9',
            {
                limit: '7',
                remaining: '8',
                reset: '9',
            },
        );
        expect(logger.debug).toHaveBeenNthCalledWith(
            4,
            'Rejected promise rate limit values. Limit 10 - Remaining 11 - Reset: 12',
            {
                limit: '10',
                remaining: '11',
                reset: '12',
            },
        );
    });

    test('should delay execution if "retry-after" header is set', async () => {
        const klaviyoService = new DummyKlaviyoService();
        await klaviyoService.checkRateLimitsAndDelay([
            {
                reason: {
                    response: {
                        headers: {
                            'retry-after': '1',
                        },
                    },
                },
                status: 'rejected',
            },
        ], 1);
        expect(logger.info).toBeCalledTimes(1);
    });

    test('should continue execution normally if "retry-after" header is not set', async () => {
        const klaviyoService = new DummyKlaviyoService();
        await klaviyoService.checkRateLimitsAndDelay([
            {
                reason: {
                    response: {
                        headers: {},
                    },
                },
                status: 'rejected',
            },
        ], 1);
        expect(logger.info).toBeCalledTimes(0);
    });

    test('should do nothing if no parameters are passed in', async () => {
        const klaviyoService = new DummyKlaviyoService();
        klaviyoService.logRateLimitHeaders();
        expect(logger.debug).toBeCalledTimes(0);
    });
});
