import { AbstractEvent } from './abstractEvent.js';
import logger from '../../utils/log';

export class ProductPublishedEvent extends AbstractEvent {
    isEventValid(): boolean {
        return this.ctMessage.resource.typeId === 'product'; // && ctMessage.notificationType === 'ResourceCreated';
    }

    generateKlaviyoEvent(): KlaviyoEvent {
        logger.info('processing CT product event');
        return {
            body: null,
        };
        // return 0;
    }
}
