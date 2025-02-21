import { Address, Customer } from '@commercetools/platform-sdk';
import { KlaviyoLocation, ProfileRequest } from '../../../types/klaviyo-types';

export interface CustomerMapper {
    mapCtCustomerToKlaviyoProfile(customer: Customer, klaviyoProfileId?: string): ProfileRequest;
    mapCTAddressToKlaviyoLocation(address?: Address, useSpecialPrefix?: boolean): KlaviyoLocation | null;
}
