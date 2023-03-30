import { KlaviyoService } from './KlaviyoService';
import logger from '../../../utils/log';
import { Client, ConfigWrapper, Events, Profiles, Catalogs } from 'klaviyo-api';
import * as dotenv from 'dotenv';
import { delaySeconds } from '../../../utils/delay-seconds';

dotenv.config();

if(!process.env.KLAVIYO_AUTH_KEY){
    logger.error('The environment variable KLAVIYO_AUTH_KEY is not set. Please set the env variable as described in the plugin installation guide and restart the application')
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
            default:
                throw new Error(`Unsupported event type ${event.type}`);
        }
    }

    public async sendJobRequestToKlaviyo(event: KlaviyoEvent): Promise<any> {
        logger.info('Sending job request in Klaviyo', { zdata: event.body });
        switch (event.type) {
            case 'itemCreated':
                return this.createItemsJob(event.body);
            case 'variantCreated':
                return this.createVariantsJob(event.body);
            default:
                throw new Error(`Unsupported event type ${event.type}`);
        }
    }

    public async getKlaviyoProfileByExternalId (externalId: string): Promise<ProfileType | undefined> {
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

    private async createOrUpdateProfile (body: KlaviyoRequestType) {
        try {
            return await Profiles.createProfile(body);
        } catch (e: any) {
            logger.error(`Error creating profile in Klaviyo. Response code ${e.status}, ${e.message}`, e)
            throw e;
        }
    }

    private async createCategory (body: KlaviyoRequestType) {
        try {
            return await Catalogs.createCatalogCategory(body);
        } catch (e: any) {
            logger.error(`Error creating category in Klaviyo. Response code ${e.status}, ${e.message}`, e)
            throw e;
        }
    }

    private async createItemsJob (body: KlaviyoRequestType) {
        let jobId;
        try {
            jobId = (await Catalogs.spawnCreateItemsJob(body)).body.data.id;
        } catch (e: any) {
            logger.error(`Error creating items job in Klaviyo. Response code ${e.status}, ${e.message}`, e)
            throw e;
        }
        let job;
        do {
            if (job) {
                logger.info(`Pausing for 10 seconds before checking status for create items job: ${jobId}`);
                await delaySeconds(10);
            }
            try {
                job = await Catalogs.getCreateItemsJob(jobId, {});
                if (job?.body.data.attributes.status !== 'processing') {
                    logger.info('hey', job?.body.data.attributes)
                }
            } catch (e: any) {
                logger.error(`Error getting items job in Klaviyo. Response code ${e.status}, ${e.message}`, e)
                throw e;
            }
        } while (job?.body.data.attributes.status === 'processing');
        logger.info(`Create items job finished with status: ${job?.body.data.attributes.status}`, job);
        return job;
    }

    private async createVariantsJob (body: KlaviyoRequestType) {
        let jobId;
        try {
            jobId = (await Catalogs.spawnCreateVariantsJob(body)).body.data.id;
        } catch (e: any) {
            logger.error(`Error creating items job in Klaviyo. Response code ${e.status}, ${e.message}`, e)
            throw e;
        }
        let job;
        do {
            if (job) {
                logger.info(`Pausing for 10 seconds before checking status for create variants job: ${jobId}`);
                await delaySeconds(10);
            }
            try {
                job = await Catalogs.getCreateVariantsJob(jobId, {});
            } catch (e: any) {
                logger.error(`Error getting items job in Klaviyo. Response code ${e.status}, ${e.message}`, e)
                throw e;
            }
        } while (job?.body.data.attributes.status === 'processing');
        logger.info(`Create variants job finished with status: ${job?.body.data.attributes.status}`, job);
        return job;
    }

    public async getKlaviyoCategoryByExternalId (externalId: string): Promise<CategoryType | undefined> {
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
}
