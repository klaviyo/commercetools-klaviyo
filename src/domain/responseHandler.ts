import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import logger from '../utils/log';
import { isFulfilled, isRejected } from '../utils/promise';

export const responseHandler = (
    results: Array<PromiseSettledResult<Awaited<Promise<any>>>>,
    ctMessage: MessageDeliveryPayload,
    logEventStats = true,
): ProcessingResult => {
    const rejected = results.filter(isRejected);
    const fulfilled = results.filter(isFulfilled);

    if (results.length === 0 && logEventStats) {
        logger.warn(
            `No processor found to handle the message. Message with notification type ${ctMessage.notificationType} and resource type '${ctMessage.resource.typeId}' ignored`,
        );
    }
    if (results.length > 0 && logEventStats) {
        logger.info(`Events to be sent to klaviyo: ${results.length}`);
        logger.info(`Events sent correctly: ${fulfilled.length}`);
    }
    if (rejected.length > 0) {
        let _5xxError = false;
        logger.error(`Events failed: ${rejected.length}`);
        rejected.forEach((error, index) => {
            logger.error(`Request ${index + 1} failed with error`, error);
            if (error?.reason?.status >= 400 && error.reason?.status < 500) {
                logger.error(
                    `Request ${index + 1} returned with status code ${error.reason.status} needs manual intervention.`,
                );
            } else if (error?.reason?.status >= 500) {
                _5xxError = true;
                logger.error(`Request failed with a 5xx status code ${error?.reason?.status}.`, error);
            } else {
                logger.error(`Request failed with a status code ${error?.reason?.status}.`, error);
            }
        });
        if (_5xxError) {
            logger.error(
                'One or more requests failed with error 5xx, sending message back to queue for retry or manual intervention.',
            );
            throw new Error(`Failed to process request for message: ${ctMessage.id}`);
        }
        return {
            status: '4xx',
        };
    }
    return {
        status: 'OK',
    };
};
