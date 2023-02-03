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
        case 'profileUpdated':
            return Client.createClientProfile(event.body, process.env.KLAVIYO_COMPANY_ID);
        default:
            throw new Error(`Unsupported event type ${event.type}`);
    }
};
