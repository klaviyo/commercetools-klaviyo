import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { CustomerTitleSetMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';

export class CustomerTitleSetEventProcessor extends AbstractEventProcessor {
    isEventValid(): boolean {
        const message = this.ctMessage as unknown as CustomerTitleSetMessage;
        return message.resource.typeId === 'customer' && message.type === 'CustomerTitleSet';
    }

    generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as CustomerTitleSetMessage;
        logger.info(`processing CT ${message.type} message`);
        const body: ProfileRequest = {
            data: {
                type: 'profile',
                attributes: {
                    title: message.title,
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
