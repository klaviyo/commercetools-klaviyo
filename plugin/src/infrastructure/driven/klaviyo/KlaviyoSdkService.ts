import { KlaviyoService } from './KlaviyoService';
import logger from '../../../utils/log';
import {
    GlobalApiKeySettings,
    Events,
    Profiles,
    Catalogs,
    GetProfileResponseData,
    CatalogCategoryCreateQuery,
    GetCatalogItemResponseCollectionCompoundDocumentDataInner,
    GetCatalogItemResponseCollectionCompoundDocument,
    GetCatalogCategoryResponseCollection,
    GetCatalogVariantResponseCollectionDataInner,
    GetCatalogCategoryResponseCollectionDataInner,
    CatalogItemCreateQuery,
    CatalogItemUpdateQuery,
    RetryWithExponentialBackoff,
} from 'klaviyo-api';
import * as dotenv from 'dotenv';
import { delaySeconds } from '../../../utils/delay-seconds';
import { StatusError } from '../../../types/errors/StatusError';
import { ItemRequest } from '../../../types/klaviyo-types';
import { KlaviyoEvent, KlaviyoRequestType } from '../../../types/klaviyo-plugin';

dotenv.config();

if (!process.env.KLAVIYO_AUTH_KEY) {
    logger.error(
        'The environment variable KLAVIYO_AUTH_KEY is not set. Please set the env variable as described in the plugin installation guide and restart the application',
    );
}

const retryWithExponentialBackoff: RetryWithExponentialBackoff = new RetryWithExponentialBackoff({
    retryCodes: [429, 503, 504, 524],
    numRetries: 5,
    maxInterval: 60,
});

// Used through instantiation, without passing it as a parameter to other classes/methods.
// See: https://github.com/klaviyo/klaviyo-api-node/blob/main/README.md#global-api-key
new GlobalApiKeySettings(process.env.KLAVIYO_AUTH_KEY || '', retryWithExponentialBackoff);

export class KlaviyoSdkService extends KlaviyoService {
    public async sendEventToKlaviyo(event: KlaviyoEvent): Promise<any> {
        logger.info(`Sending event of type ${event.type} to Klaviyo`);
        switch (event.type) {
            case 'event':
                return Events.createEvent(event.body);
            case 'profileCreated':
                return this.createOrUpdateProfile(event.body, true);
            case 'profileResourceUpdated':
                return this.createOrUpdateProfile(event.body, false);
            case 'categoryCreated':
                return this.createCategory(event.body);
            case 'categoryDeleted':
                return Catalogs.deleteCatalogCategory(event.body.data.id);
            case 'categoryUpdated':
                return Catalogs.updateCatalogCategory(event.body.data?.id, event.body);
            case 'variantCreated':
                return Catalogs.createCatalogVariant(event.body);
            case 'variantUpdated':
                return Catalogs.updateCatalogVariant(event.body.data?.id, event.body);
            case 'variantDeleted':
                return Catalogs.deleteCatalogVariant(event.body.data?.id);
            case 'itemDeleted':
                return this.deleteCatalogItemWithVariants(event.body.data.id);
            case 'itemCreated':
                return this.createUpdateItem(event.body as ItemRequest, 'itemCreated');
            case 'itemUpdated':
                return this.createUpdateItem(event.body as ItemRequest, 'itemUpdated');
            default:
                throw new Error(`Unsupported event type ${event.type}`);
        }
    }

    public async sendJobRequestToKlaviyo(event: KlaviyoEvent): Promise<any> {
        logger.info(`Sending job request to Klaviyo with type ${event.type}`);
        switch (event.type) {
            case 'itemCreated':
                return this.spawnCreateJob(event.body, event.type);
            case 'itemUpdated':
                return this.spawnCreateJob(event.body, event.type);
            case 'variantCreated':
                return this.spawnCreateJob(event.body, event.type);
            case 'variantUpdated':
                return this.spawnCreateJob(event.body, event.type);
            case 'variantDeleted':
                return this.spawnCreateJob(event.body, event.type);
            default:
                throw new Error(`Unsupported event type ${event.type}`);
        }
    }

    public async getKlaviyoProfileByExternalId(externalId: string): Promise<GetProfileResponseData | undefined> {
        logger.info(`Getting profile in Klaviyo with externalId ${externalId}`);
        try {
            const filter = `equals(external_id,"${externalId}")`;
            const profiles = await Profiles.getProfiles({ filter });
            const profile = profiles?.body.data?.find(
                (profile: GetProfileResponseData) => profile.attributes.externalId === externalId,
            );
            return profile;
        } catch (e) {
            logger.error(`Error getting profile in Klaviyo with externalId ${externalId}`);
            throw e;
        }
    }

    public async getKlaviyoProfileByEmail(email: string): Promise<GetProfileResponseData | undefined> {
        logger.info(`Getting profile in Klaviyo with email ${email}`);
        try {
            const filter = `equals(email,"${email}")`;
            const profiles = await Profiles.getProfiles({ filter });
            // If multiple profiles exist with same email, return the first one
            // In practice, Klaviyo should prevent duplicates, but we handle edge case
            const profile = profiles?.body.data?.find(
                (profile: GetProfileResponseData) => profile.attributes.email === email,
            );
            if (profiles?.body.data && profiles.body.data.length > 1) {
                logger.warn(
                    `Multiple profiles found with email ${email}. Using first match. Total: ${profiles.body.data.length}`,
                );
            }
            return profile;
        } catch (e: any) {
            logger.error(`Error getting profile in Klaviyo with email ${email}: ${e.message}`, e);
            throw e;
        }
    }

    private async createOrUpdateProfile(body: KlaviyoRequestType, create: boolean) {
        try {
            return await this.processProfileOperation(body, create);
        } catch (e: any) {
            if (e.status !== 400) {
                logger.error(
                    `Error ${create ? 'creating' : 'updating'} profile in Klaviyo. Response code ${e.status}, ${
                        e.message
                    }`,
                    e,
                );
                throw e;
            }

            const errorCauses = this.extractErrorCauses(e);
            if (errorCauses.includes('/data/attributes/phone_number')) {
                return this.retryProfileOperationWithoutPhoneNumber(body, create, e);
            }

            throw new StatusError(
                400,
                `Bad request. Error causes: ${errorCauses.join(', ')}. Request body: ${JSON.stringify(body)}`,
            );
        }
    }

    private async processProfileOperation(body: KlaviyoRequestType, create: boolean) {
        return create ? Profiles.createProfile(body) : Profiles.updateProfile(body.data.id!, body);
    }

    private extractErrorCauses(e: any): string[] {
        try {
            return (e.response?.data?.errors || []).map((err: any) => err?.source?.pointer);
        } catch (error) {
            logger.error('Error getting error source pointer from error response', error);
            throw new StatusError(400, 'Bad request, error getting error source pointer from error response.');
        }
    }

    private async retryProfileOperationWithoutPhoneNumber(body: KlaviyoRequestType, create: boolean, e: any) {
        logger.info(
            `Invalid phone number when ${
                create ? 'creating' : 'updating'
            } profile. Retrying after removing phone number from profile...`,
        );

        const modifiedBody = {
            data: {
                ...body.data,
                attributes: {
                    ...(body.data as any).attributes,
                    phoneNumber: undefined,
                },
            },
        };

        try {
            return await this.processProfileOperation(modifiedBody, create);
        } catch (error: any) {
            logger.error(
                `Error ${
                    create ? 'creating' : 'updating'
                } profile in Klaviyo after removing phone_number. Response code ${error.status}, ${error.message}`,
                error,
            );
            throw error;
        }
    }

    private async createCategory(body: CatalogCategoryCreateQuery) {
        try {
            return await Catalogs.createCatalogCategory(body);
        } catch (e: any) {
            logger.error(`Error creating category in Klaviyo. Response code ${e.status}, ${e.message}`, e);
            throw e;
        }
    }

    private async deleteCatalogItemWithVariants(itemId: string) {
        try {
            return await Catalogs.deleteCatalogItem(itemId);
        } catch (e: any) {
            logger.error(`Error deleting item in Klaviyo. Response code ${e.status}, ${e.message}`, e);
            if ((e.response?.status || e.status) === 404) {
                logger.error(`Item with itemId ${itemId} does not exist in Klaviyo. Failed to delete, ignoring.`);
                // Avoid returning a 4XX error to the queue for this, just in case.
                // This would end up returning the message to the queue indefinitely.
                // The product may have been deleted manually with some other method.
                return {
                    status: 202,
                    message: `Item with itemId ${itemId} does not exist in Klaviyo. Failed to delete, ignoring.`,
                };
            }
            throw e;
        }
    }

    private async createUpdateItem(body: ItemRequest, type: string) {
        try {
            let baseItemRequest;
            const { data } = body;
            if (type === 'itemCreated') {
                baseItemRequest = await Catalogs.createCatalogItem({ data } as unknown as CatalogItemCreateQuery);
            } else if (type === 'itemUpdated') {
                const updateData = { data } as unknown as CatalogItemUpdateQuery;
                baseItemRequest = await Catalogs.updateCatalogItem(updateData.data.id, updateData);
            }

            return baseItemRequest;
        } catch (e: any) {
            logger.error(
                `Error ${type === 'itemCreated' ? 'creating' : 'updating'} item in Klaviyo. Response code ${
                    e.status
                }, ${e.message}`,
                e,
            );
            throw e;
        }
    }

    private async spawnCreateJob(body: KlaviyoRequestType, type: string) {
        let jobId: string;
        const jobMethods: any = {
            itemCreated: {
                spawnJob: () => Catalogs.spawnCreateItemsJob(body),
                getJob: (id: string) => Catalogs.getCreateItemsJob(id, {}),
            },
            itemUpdated: {
                spawnJob: () => Catalogs.spawnUpdateItemsJob(body),
                getJob: (id: string) => Catalogs.getUpdateItemsJob(id, {}),
            },
            variantCreated: {
                spawnJob: () => Catalogs.spawnCreateVariantsJob(body),
                getJob: (id: string) => Catalogs.getCreateVariantsJob(id, {}),
            },
            variantUpdated: {
                spawnJob: () => Catalogs.spawnUpdateVariantsJob(body),
                getJob: (id: string) => Catalogs.getUpdateVariantsJob(id, {}),
            },
            variantDeleted: {
                spawnJob: () => Catalogs.spawnDeleteVariantsJob(body),
                getJob: (id: string) => Catalogs.getDeleteVariantsJob(id, {}),
            },
        };

        try {
            jobId = (await jobMethods[type].spawnJob()).body.data.id;
        } catch (e: any) {
            logger.error(`Error spawning ${type} job in Klaviyo. Response code ${e.status}, ${e.message}`, e);
            throw e;
        }
        let job;
        do {
            if (job) {
                logger.info(`Pausing for 10 seconds before checking status for ${type} job: ${jobId}`);
                await delaySeconds(10);
            }
            try {
                job = await jobMethods[type].getJob(jobId);
            } catch (e: any) {
                logger.error(`Error getting items job in Klaviyo. Response code ${e.status}, ${e.message}`, e);
                throw e;
            }
        } while (job?.body.data.attributes.status === 'processing');
        logger.info(
            `Job with type ${type} and id ${jobId} finished with status: ${job?.body.data.attributes.status}`,
            job,
        );
        job.body.data.attributes.errors?.forEach((err: any) => {
            logger.info(`Error for job with type ${type} and id ${jobId}: ${err.detail}`);
        });
        return job;
    }

    public async getKlaviyoCategoryByExternalId(
        externalId: string,
    ): Promise<GetCatalogCategoryResponseCollectionDataInner | undefined> {
        logger.info(`Getting categories in Klaviyo with externalId ${externalId}`);
        try {
            const filter = `any(ids,["$custom:::$default:::${externalId}"])`;
            const categories = await Catalogs.getCatalogCategories({ filter });
            logger.debug('Categories response', categories);
            const category = categories?.body.data?.find((category) => category.attributes.externalId === externalId);
            logger.debug('Category', category);
            return category;
        } catch (e) {
            logger.error(`Error getting category in Klaviyo with externalId ${externalId}`);
            throw e;
        }
    }

    public async getKlaviyoItemsByIds(ids: string[], fieldsCatalogItem?: any[]) {
        if (!ids.length) {
            return [];
        } else {
            logger.info(`Getting items in Klaviyo with ids: ${ids.join(',')}`);
            try {
                const formattedIds = ids.map((id) => `$custom:::$default:::${id}`);
                const filter = `any(ids,["${formattedIds.join('","')}"])`;
                const items = await Catalogs.getCatalogItems({ filter, fieldsCatalogItem });
                logger.debug('Items response', items);
                return items.body.data;
            } catch (e) {
                logger.error(`Error getting items in Klaviyo with ids: ${ids.join(',')}`);
                throw e;
            }
        }
    }

    public async getKlaviyoItemVariantsByCtSkus(
        productId?: string,
        skus?: string[],
        fieldsCatalogVariant?: any[],
    ): Promise<GetCatalogVariantResponseCollectionDataInner[]> {
        let filter;
        if (skus && !skus.length) {
            return [];
        } else if (skus && skus.length) {
            const formattedIds = skus.map((sku) => `$custom:::$default:::${sku}`);
            filter = `any(ids,["${formattedIds.join('","')}"])`;
        }
        try {
            logger.info(
                `Getting variants in Klaviyo for productId: ${productId}` +
                    (skus?.length ? ` with SKUs: ${skus?.join(',')}` : ''),
            );
            const itemId = productId ? `$custom:::$default:::${productId}` : undefined;
            const variants = itemId
                ? await Catalogs.getCatalogItemVariants(itemId, { filter, fieldsCatalogVariant })
                : await Catalogs.getCatalogVariants({ filter, fieldsCatalogVariant });
            logger.debug('Variants response', variants);
            return variants.body.data;
        } catch (e: any) {
            logger.error(
                `Error getting variants in Klaviyo for productId: ${productId}` +
                    (skus?.length ? ` with SKUs: ${skus?.join(',')}` : ''),
            );
            if (e.status === 404) {
                return [];
            }
            throw e;
        }
    }

    public async getKlaviyoPaginatedCategories(nextPageCursor?: string): Promise<GetCatalogCategoryResponseCollection> {
        logger.info(
            `Getting categories in Klaviyo ${nextPageCursor ? 'with pagination cursor: ' + nextPageCursor : ''}`,
        );
        try {
            const categories = await Catalogs.getCatalogCategories({ pageCursor: nextPageCursor });
            logger.debug('Categories response', categories);
            return categories.body;
        } catch (e) {
            logger.error(
                `Error getting categories in Klaviyo ${
                    nextPageCursor ? 'with pagination cursor: ' + nextPageCursor : ''
                }`,
            );
            throw e;
        }
    }

    public async getKlaviyoPaginatedItems(
        nextPageCursor?: string,
    ): Promise<GetCatalogItemResponseCollectionCompoundDocument> {
        logger.info(`Getting items in Klaviyo ${nextPageCursor ? 'with pagination cursor: ' + nextPageCursor : ''}`);
        try {
            const categories = await Catalogs.getCatalogItems({ pageCursor: nextPageCursor });
            logger.debug('Items response', categories);
            return categories.body;
        } catch (e) {
            logger.error(
                `Error getting items in Klaviyo ${nextPageCursor ? 'with pagination cursor: ' + nextPageCursor : ''}`,
            );
            throw e;
        }
    }

    public async getKlaviyoItemByExternalId(
        externalId: string,
    ): Promise<GetCatalogItemResponseCollectionCompoundDocumentDataInner | undefined> {
        logger.info(`Getting item in Klaviyo with externalId ${externalId}`);
        try {
            const itemId = `$custom:::$default:::${externalId}`;
            const item = await Catalogs.getCatalogItem(itemId, {});
            logger.debug('Item response', item);
            return item.body.data;
        } catch (e: any) {
            if (e.status === 404) {
                return undefined;
            }
            logger.error(`Error getting item in Klaviyo with externalId ${externalId}`);
            throw e;
        }
    }
}
