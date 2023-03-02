import { Customer } from '@commercetools/platform-sdk';

export interface CustomerMapper {
    mapCtCustomerToKlaviyoProfile(cusutomer: Customer): ProfileRequest;
}
