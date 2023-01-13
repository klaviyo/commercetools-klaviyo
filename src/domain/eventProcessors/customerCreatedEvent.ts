import { AbstractEvent } from './abstractEvent.js';
import logger from '../../utils/log';

export class CustomerCreatedEvent extends AbstractEvent {
    isEventValid(): boolean {
        return this.ctMessage.resource.typeId === 'customer'; // && ctMessage.notificationType === 'ResourceCreated';
    }

    generateKlaviyoEvent(): KlaviyoEvent {
        logger.info('processing CT customer event');
        return {
            body: null,
        };
        // return 0;
    }
}
