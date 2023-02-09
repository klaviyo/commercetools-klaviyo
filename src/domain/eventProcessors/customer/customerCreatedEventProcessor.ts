import { AbstractEvent } from '../abstractEvent';
import logger from '../../../utils/log';
import { CustomerCreatedMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import { mapCTCustomerToKlaviyoProfile } from './mappers/CTCustomerToKlaviyoProfileMapper';

export class CustomerCreatedEventProcessor extends AbstractEvent {
    isEventValid(): boolean {
        const customerCreatedMessage = this.ctMessage as unknown as CustomerCreatedMessage;
        return (
            customerCreatedMessage.resource.typeId === 'customer' &&
            customerCreatedMessage.type === 'CustomerCreated' &&
            !!customerCreatedMessage.customer &&
            !!customerCreatedMessage.customer.email
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as CustomerCreatedMessage;
        logger.info(`processing CT ${message.type} message`);
        const body: ProfileRequest = {
            data: {
                type: 'profile',
                attributes: mapCTCustomerToKlaviyoProfile(message.customer),
                meta: {
                    identifiers: {
                        external_id: message.resource.id,
                    },
                },
            },
        };
        return [
            {
                body,
                type: 'profileUpdated',
            },
        ];
    }
}
