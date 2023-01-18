import { ConfigWrapper, Events } from 'klaviyo-api';
import logger from '../utils/log';

ConfigWrapper(process.env.KLAVIYO_AUTH_KEY);

export const sendEventToKlaviyo = async (event: KlaviyoEvent) => {
    try {
        if (event.body) {
            logger.info('Sending event to Klaviyo', { zdata: event.body });
            return await Events.createEvent(event.body);
        } else {
            logger.warn('Event not sent to klaviyo as the body of the request is not present');
        }
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        logger.error(`Error sending event to Klaviyo, HTTP response code ${error.status}`, error);
        throw new Error(`Error sending event to klaviyo`);
    }
};
