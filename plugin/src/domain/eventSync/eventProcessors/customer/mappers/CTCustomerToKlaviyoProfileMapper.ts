import { Customer } from '@commercetools/platform-sdk';
import { getCTCustomerAddressForKlaviyo, getPhoneNumber } from '../utils/CustomerAddressUtils';
import { mapCTAddressToKlaviyoLocation } from './CTAddressToKlaviyoLocationMapper';
import { Profile } from '../../../../../types/klaviyo-types';

/**
 * Maps a commercetools customer to the Klaviyo profile request attributes
 * @param customer
 */
export const mapCTCustomerToKlaviyoProfile = (customer: Customer): Profile => {
    const address = getCTCustomerAddressForKlaviyo(customer);
    const {
        email,
        firstName: first_name,
        lastName: last_name,
        title,
        companyName: organization,
        id: external_id,
        custom,
    } = customer;

    return {
        email,
        external_id,
        first_name,
        last_name,
        title,
        phone_number: getPhoneNumber(address),
        organization,
        location: mapCTAddressToKlaviyoLocation(address),
        properties: custom?.fields,
    };
};
