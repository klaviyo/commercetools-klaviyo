import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { CustomerFirstNameSetMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import { ProfileRequest } from '../../../../types/klaviyo-types';
import { KlaviyoEvent } from '../../../../types/klaviyo-plugin';

export class CustomerFirstNameSetEventProcessor extends AbstractEventProcessor {
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
