import { AbstractEvent } from '../abstractEvent';
import logger from '../../../utils/log';
import { CustomerCreatedMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import {
    getCTCustomerAddressForKlaviyo,
    getPhoneNumber,
    mapCTAddressToKlaviyoLocation,
} from './utils/CustomerAddressUtils';

export class CustomerCreatedEvent extends AbstractEvent {
    isEventValid(): boolean {
        const customerCreatedMessage = this.ctMessage as unknown as CustomerCreatedMessage;
        return (
            customerCreatedMessage.resource.typeId === 'customer' &&
            customerCreatedMessage.type === 'CustomerCreated' &&
            !!customerCreatedMessage.customer &&
            !!customerCreatedMessage.customer.email
        );
    }

    generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as CustomerCreatedMessage;
        logger.info(`processing CT ${message.type} message`);
        const address = getCTCustomerAddressForKlaviyo(message.customer);
        const body: ProfileRequest = {
            data: {
                type: 'profile',
                attributes: {
                    email: message.customer.email,
                    first_name: message.customer.firstName,
                    last_name: message.customer.lastName,
                    title: message.customer.title,
                    phone_number: getPhoneNumber(address?.phone),
                    organization: message.customer.companyName,
                    location: mapCTAddressToKlaviyoLocation(address),
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
