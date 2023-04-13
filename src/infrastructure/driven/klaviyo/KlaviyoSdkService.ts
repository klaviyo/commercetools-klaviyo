import { KlaviyoService } from './KlaviyoService';
import logger from '../../../utils/log';
import { Client, ConfigWrapper, Events, Profiles, Catalogs } from 'klaviyo-api';
import * as dotenv from 'dotenv';
import { delaySeconds } from '../../../utils/delay-seconds';

dotenv.config();

if (!process.env.KLAVIYO_AUTH_KEY) {
    logger.error(
        'The environment variable KLAVIYO_AUTH_KEY is not set. Please set the env variable as described in the plugin installation guide and restart the application',
    );
}

ConfigWrapper(process.env.KLAVIYO_AUTH_KEY);
export class KlaviyoSdkService extends KlaviyoService {
    public async sendEventToKlaviyo(event: KlaviyoEvent): Promise<any> {
        logger.info('Sending event to Klaviyo', { zdata: event.body });
        switch (event.type) {
            case 'event':
                return Events.createEvent(event.body);
            case 'profileCreated':
                return this.createOrUpdateProfile(event.body);
            case 'profileResourceUpdated':
                return Profiles.updateProfile(event.body, event.body.data?.id);
            case 'profileUpdated':
                return Client.createClientProfile(event.body, process.env.KLAVIYO_COMPANY_ID);
            case 'categoryCreated':
                return this.createCategory(event.body);
            case 'categoryDeleted':
                return Catalogs.deleteCatalogCategory(event.body.data.id);
            case 'categoryUpdated':
                return Catalogs.updateCatalogCategory(event.body, event.body.data?.id);
            case 'itemDeleted':
                return this.deleteCatalogItemWithVariants(event.body.data.id, (event.body.data as any).deleteVariantsJob);
            default:
                throw new Error(`Unsupported event type ${event.type}`);
        }
    }

    public async sendJobRequestToKlaviyo(event: KlaviyoEvent): Promise<any> {
        logger.info('Sending job request in Klaviyo', { zdata: event.body });
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

    public async getKlaviyoProfileByExternalId(externalId: string): Promise<ProfileType | undefined> {
        logger.info(`Getting profile in Klaviyo with externalId ${externalId}`);
        try {
            const filter = `equals(external_id,"${externalId}")`;
            const profiles = await Profiles.getProfiles({ filter });
            logger.debug('Profiles response', profiles);
            const profile = profiles?.body.data?.find(
                (profile: ProfileType) => profile.attributes.external_id === externalId,
            );
            logger.debug('Profile', profile);
            return profile;
        } catch (e) {
            logger.error(`Error getting profile in Klaviyo with externalId ${externalId}`);
            throw e;
        }
    }

    private async createOrUpdateProfile(body: KlaviyoRequestType) {
        try {
            return await Profiles.createProfile(body);
        } catch (e: any) {
            logger.error(`Error creating profile in Klaviyo. Response code ${e.status}, ${e.message}`, e);
            throw e;
        }
    }

    private async createCategory(body: KlaviyoRequestType) {
        try {
            return await Catalogs.createCatalogCategory(body);
        } catch (e: any) {
            logger.error(`Error creating category in Klaviyo. Response code ${e.status}, ${e.message}`, e);
            throw e;
        }
    }

    private async deleteCatalogItemWithVariants(itemId?: string, deleteVariantsJob?: KlaviyoEvent) {
        try {
            if (deleteVariantsJob) {
                await this.spawnCreateJob(deleteVariantsJob.body, deleteVariantsJob.type);
            }
            return await Catalogs.deleteCatalogItem(itemId);
        } catch (e: any) {
            logger.error(`Error deleting item in Klaviyo. Response code ${e.status}, ${e.message}`, e);
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

    public async getKlaviyoCategoryByExternalId(externalId: string): Promise<CategoryType | undefined> {
        logger.info(`Getting categories in Klaviyo with externalId ${externalId}`);
        try {
            const filter = `any(ids,["$custom:::$default:::${externalId}"])`;
            const categories = await Catalogs.getCatalogCategories({ filter });
            logger.debug('Categories response', categories);
            const category = categories?.body.data?.find(
                (category: CategoryType) => category.attributes.external_id === externalId,
            );
            logger.debug('Category', category);
            return category;
        } catch (e) {
            logger.error(`Error getting category in Klaviyo with externalId ${externalId}`);
            throw e;
        }
    }

    public async getKlaviyoItemsByIds(ids: string[], fieldsCatalogItem?: string[]): Promise<ItemType[]> {
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
        fieldsCatalogVariant?: string[],
    ): Promise<ItemVariantType[]> {
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
}
