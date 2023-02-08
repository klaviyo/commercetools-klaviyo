import { Customer } from '@commercetools/platform-sdk';
import { getCTCustomerAddressForKlaviyo, getPhoneNumber } from '../utils/CustomerAddressUtils';
import { mapCTAddressToKlaviyoLocation } from './CTAddressToKlaviyoLocationMapper';

/**
 * Maps a commercetools customer to the Klaviyo profile request attributes
 * @param customer
 */
export const mapCTCustomerToKlaviyoProfile = (customer: Customer): Profile => {
    const address = getCTCustomerAddressForKlaviyo(customer);
    const { email, firstName, lastName, title, companyName } = customer;

    return {
        email,
        first_name: firstName,
        last_name: lastName,
        title,
        phone_number: getPhoneNumber(address),
        organization: companyName,
        location: mapCTAddressToKlaviyoLocation(address),
    };
};
