import { ConfigWrapper, Events, Profiles } from 'klaviyo-api';
import logger from '../utils/log';

ConfigWrapper(process.env.KLAVIYO_AUTH_KEY);

export const sendEventToKlaviyo = async (event: KlaviyoEvent) => {
    logger.info('Sending event to Klaviyo', { zdata: event.body });
    switch (event.type) {
        case 'event':
            return Events.createEvent(event.body);
        case 'profile':
            return Profiles.createProfile(event.body);
        default:
            throw new Error(`Unsupported event type ${event.type}`);
    }
};
