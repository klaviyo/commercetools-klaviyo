import { ConfigWrapper, Events } from 'klaviyo-api';
import logger from '../utils/log';

ConfigWrapper(process.env.KLAVIYO_AUTH_KEY);

export const sendEventToKlaviyo = async (event: KlaviyoEvent) => {
    logger.info('Sending event to Klaviyo', { zdata: event.body });
    return Events.createEvent(event.body);
};
