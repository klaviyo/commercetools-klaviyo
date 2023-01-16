import { ConfigWrapper, Events } from 'klaviyo-api';
import logger from '../utils/log';

ConfigWrapper(process.env.KLAVIYO_AUTH_KEY);

export const sendEventToKlaviyo = (event: KlaviyoEvent) => {
    try {
        if (event.body) {
            logger.info('Sending event to Klaviyo', { zdata: event.body });
            Events.createEvent(event.body);
        } else {
            logger.warn('Event not sent to klaviyo as the body of the request is not present');
        }
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        logger.error(`An error was thrown check the HTTP code with ${error.status}`);
    }
};
