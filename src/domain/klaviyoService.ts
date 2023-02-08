import { Client, ConfigWrapper, Events, Profiles } from 'klaviyo-api';
import logger from '../utils/log';

ConfigWrapper(process.env.KLAVIYO_AUTH_KEY);

export const sendEventToKlaviyo = async (event: KlaviyoEvent) => {
    logger.info('Sending event to Klaviyo', { zdata: event.body });
    switch (event.type) {
        case 'event':
            return Events.createEvent(event.body);
        case 'profileCreated':
            return Profiles.createProfile(event.body);
        case 'profileResourceUpdated':
            return Profiles.updateProfile(event.body, event.body.data?.id);
        case 'profileUpdated':
            return Client.createClientProfile(event.body, process.env.KLAVIYO_COMPANY_ID);
        default:
            throw new Error(`Unsupported event type ${event.type}`);
    }
};

export const getKlaviyoProfileByExternalId = async (externalId: string): Promise<ProfileType | undefined> => {
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
};
