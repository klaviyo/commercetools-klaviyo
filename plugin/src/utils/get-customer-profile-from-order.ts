import { Order } from '@commercetools/platform-sdk';
import { CustomerMapper } from '../domain/shared/mappers/CustomerMapper';
import { KlaviyoEventProfile } from '../types/klaviyo-types';

export const getCustomerProfileFromOrder = (
    order: Order,
    customerMapper: CustomerMapper,
    updateAdditionalProfileProperties = false,
): KlaviyoEventProfile => {
    const profile: KlaviyoEventProfile = {
        type: 'profile',
        attributes: {},
    };
    if (order.customerEmail) {
        profile.attributes.email = order.customerEmail;
    }
    if (order.customerId) {
        profile.attributes.externalId = order.customerId;
    }
    if (updateAdditionalProfileProperties) {
        if (order.billingAddress) {
            const location = customerMapper.mapCTAddressToKlaviyoLocation(order.billingAddress, false);
            if (location) {
                profile.attributes = {
                    ...profile.attributes,
                    ...location,
                };
            }
        }
    }
    return profile;
};
