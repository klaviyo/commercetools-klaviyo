import { AbstractEvent } from './abstractEvent';
import logger from '../../utils/log';
import { CustomerCreatedMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import { Address } from '@commercetools/platform-sdk';

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

    generateKlaviyoEvents(): KlaviyoEvent[] {
        logger.info('processing CT customer created message');
        const customerCreatedMessage = this.ctMessage as unknown as CustomerCreatedMessage;
        const address = this.getCTCustomerAddress();
        const body = {
            data: {
                type: 'profile',
                attributes: {
                    external_id: customerCreatedMessage.customer.id,
                    email: customerCreatedMessage.customer.email,
                    first_name: customerCreatedMessage.customer.firstName,
                    last_name: customerCreatedMessage.customer.lastName,
                    title: customerCreatedMessage.customer.title,
                    phone_number: address?.phone,
                    organization: customerCreatedMessage.customer.companyName,
                    location: {
                        address1: this.getAddress1(address),
                        address2: this.getAddress2(address),
                        city: address?.city,
                        country: address?.country,
                        // latitude: null,
                        // longitude: null,
                        region: address?.region,
                        zip: address?.postalCode,
                        // timezone: null,
                    },
                },
            },
        };
        return [
            {
                body,
                type: 'profile',
            },
        ];
    }

    getCTCustomerAddress(): Address | undefined {
        const customerCreatedMessage = this.ctMessage as unknown as CustomerCreatedMessage;
        if (customerCreatedMessage.customer.defaultBillingAddressId) {
            return customerCreatedMessage.customer.addresses.find(
                (address) => address.id === customerCreatedMessage.customer.defaultBillingAddressId,
            );
        }
        if (
            customerCreatedMessage.customer.billingAddressIds &&
            customerCreatedMessage.customer.billingAddressIds.length
        ) {
            return customerCreatedMessage.customer.addresses.find(
                (address) => address.id === customerCreatedMessage?.customer?.billingAddressIds?.find(() => true),
            );
        }
        return customerCreatedMessage.customer.addresses.find(() => true);
    }

    getAddress1(address?: Address): string | undefined {
        return address
            ? [address.apartment, address.building, address.streetNumber, address.streetName]
                  .filter((element) => element)
                  .join(', ')
            : undefined;
    }

    getAddress2(address?: Address): string | undefined {
        return address
            ? [address.additionalStreetInfo, address.additionalAddressInfo].filter((element) => element).join(', ')
            : undefined;
    }
}
