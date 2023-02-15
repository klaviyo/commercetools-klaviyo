import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../utils/log';
import { CustomerCompanyNameSetMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';

export class CustomerCompanyNameSetEventProcessor extends AbstractEventProcessor {
    isEventValid(): boolean {
        const message = this.ctMessage as unknown as CustomerCompanyNameSetMessage;
        return message.resource.typeId === 'customer' && message.type === 'CustomerCompanyNameSet';
    }

    generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as CustomerCompanyNameSetMessage;
        logger.info(`processing CT ${message.type} message`);
        const body: ProfileRequest = {
            data: {
                type: 'profile',
                attributes: {
                    organization: message.companyName,
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
