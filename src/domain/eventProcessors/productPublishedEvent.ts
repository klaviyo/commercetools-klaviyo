import { AbstractEvent } from './abstractEvent';
import logger from '../../utils/log';

export class ProductPublishedEvent extends AbstractEvent {
    isEventValid(): boolean {
        return this.ctMessage.resource.typeId === 'product'; // && ctMessage.notificationType === 'ResourceCreated';
    }

    generateKlaviyoEvent(): KlaviyoEvent {
        logger.info('processing CT product event');
        return {
            body: null,
            type: 'event',
        };
    }
}
