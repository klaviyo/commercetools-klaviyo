import { AbstractEvent } from '../abstractEvent';
import logger from '../../../utils/log';
import {
    CustomerAddressAddedMessage,
    CustomerAddressChangedMessage,
    CustomerAddressRemovedMessage,
} from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import { getCustomerProfile } from '../../ctService';
import { getCTCustomerAddressForKlaviyo, getPhoneNumber } from './utils/CustomerAddressUtils';
import { mapCTAddressToKlaviyoLocation } from './mappers/CTAddressToKlaviyoLocationMapper';
import config from 'config';

export class CustomerAddressUpdateEventProcessor extends AbstractEvent {
    isEventValid(): boolean {
        const message = this.ctMessage as unknown as
            | CustomerAddressAddedMessage
            | CustomerAddressRemovedMessage
            | CustomerAddressChangedMessage;
        return (
            message.resource.typeId === 'customer' &&
            Boolean(config.get<string[]>('customer.messages.addressChanged').includes(message.type))
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as
            | CustomerAddressAddedMessage
            | CustomerAddressRemovedMessage
            | CustomerAddressChangedMessage;
        logger.info(`processing CT ${message.type} message`);
        const customer = await getCustomerProfile(message.resource.id);
        const address = getCTCustomerAddressForKlaviyo(customer);

        const body: ProfileRequest = {
            data: {
                type: 'profile',
                attributes: {
                    phone_number: getPhoneNumber(address),
                    location: mapCTAddressToKlaviyoLocation(address),
                },
                meta: {
                    identifiers: {
                        external_id: message.resource.id,
                    },
                },
            },
        };
        return [
            {
                body: body,
                type: 'profileUpdated',
            },
        ];
    }
}
