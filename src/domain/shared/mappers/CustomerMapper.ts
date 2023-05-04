import { Address, Customer } from '@commercetools/platform-sdk';

export interface CustomerMapper {
    mapCtCustomerToKlaviyoProfile(customer: Customer, klaviyoProfileId?: string): ProfileRequest;
    mapCTAddressToKlaviyoLocation(address?: Address, useSpecialPrefix?: boolean): KlaviyoLocation | null;
}
