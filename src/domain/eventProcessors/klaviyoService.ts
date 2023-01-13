import { ConfigWrapper, Events } from 'klaviyo-api';
import logger from '../../utils/log';

ConfigWrapper(process.env.KLAVIYO_AUTH_KEY);

export const sendEventToKlaviyo = (event: KlaviyoEvent) => {
    try {
        if (event.body) {
            logger.debug('Sending event to Klaviyo: ', event.body);
            Events.createEvent(event);
        }
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        console.error(`An error was thrown check the HTTP code with ${error.status}`);
    }
};
