import { AbstractEvent } from '../abstractEvent';
import logger from '../../../utils/log';
import { CustomerFirstNameSetMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';

export class CustomerFirstNameSetEventProcessor extends AbstractEvent {
    isEventValid(): boolean {
        const message = this.ctMessage as unknown as CustomerFirstNameSetMessage;
        return message.resource.typeId === 'customer' && message.type === 'CustomerFirstNameSet';
    }

    generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as CustomerFirstNameSetMessage;
        logger.info(`processing CT ${message.type} message`);
        const body: ProfileRequest = {
            data: {
                type: 'profile',
                attributes: {
                    first_name: message.firstName,
                },
                meta: {
                    identifiers: {
                        external_id: message.resource.id,
                    },
                },
            },
        };
        return Promise.resolve([
            {
                body,
                type: 'profileUpdated',
            },
        ]);
    }
}
