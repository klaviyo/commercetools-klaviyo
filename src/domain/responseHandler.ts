import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import logger from '../utils/log';

export const responseHandler = (
    results: Array<PromiseSettledResult<Awaited<Promise<any>>>>,
    ctMessage: MessageDeliveryPayload,
): ProcessingResult => {
    const rejected = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
    const fulfilled = results.filter((result) => result.status === 'fulfilled');

    if (results.length === 0) {
        logger.warn(
            `No processor found to handle the message. Message with notification type ${ctMessage.notificationType} and resource type '${ctMessage.resource.typeId}' ignored`,
        );
    }
    if (results.length > 0) {
        logger.info(`Events to be sent to klaviyo: ${results.length}`);
        logger.info(`Events sent correctly: ${fulfilled.length}`);
    }
    if (rejected.length > 0) {
        let _5xxError = false;
        logger.error(`Events failed: ${rejected.length}`);
        rejected.forEach((error, index) => {
            logger.error(`Request ${index + 1} failed with error`, error);
            if (error.reason && error.reason.status && error.reason.status >= 400 && error.reason.status < 500) {
                logger.error(
                    `Request ${index + 1} returned with status code ${error.reason.status} needs manual intervention.`,
                );
            } else {
                _5xxError = true;
                logger.error(`Request failed with a status code ${error.reason.status}.`);
            }
        });
        if (_5xxError) {
            logger.error(
                'One or more requests failed with error 5xx, sending message back to queue for retry or manual intervention.',
            );
            throw new Error('Failed to send data to klaviyo');
        }
        return {
            status: '4xx',
        };
    }
    return {
        status: 'OK',
    };
};
