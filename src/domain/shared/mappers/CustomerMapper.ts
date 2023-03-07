import { Customer } from '@commercetools/platform-sdk';

export interface CustomerMapper {
    mapCtCustomerToKlaviyoProfile(customer: Customer, klaviyoProfileId?: string): ProfileRequest;
}
