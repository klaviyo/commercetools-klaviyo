import { Customer } from '@commercetools/platform-sdk';
import { CustomerMapper } from './CustomerMapper';
import {
    getCTCustomerAddressForKlaviyo,
    getPhoneNumber,
} from '../../eventSync/eventProcessors/customer/utils/CustomerAddressUtils';
import { mapCTAddressToKlaviyoLocation } from '../../eventSync/eventProcessors/customer/mappers/CTAddressToKlaviyoLocationMapper';

export class DefaultCustomerMapper implements CustomerMapper {
    public mapCtCustomerToKlaviyoProfile(customer: Customer): ProfileRequest {
        const address = getCTCustomerAddressForKlaviyo(customer);
        const {
            email,
            firstName: first_name,
            lastName: last_name,
            title,
            companyName: organization,
            id: external_id,
        } = customer;

        return {
            data: {
                type: 'profile',
                attributes: {
                    email,
                    external_id,
                    first_name,
                    last_name,
                    title,
                    phone_number: getPhoneNumber(address),
                    organization,
                    location: mapCTAddressToKlaviyoLocation(address),
                },
            },
        };
    }
}
