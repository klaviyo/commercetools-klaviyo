import { Order } from '@commercetools/platform-sdk';
import { CustomerMapper } from '../domain/shared/mappers/CustomerMapper';

export const getCustomerProfileFromOrder = (
    order: Order,
    customerMapper: CustomerMapper,
    updateAdditionalProfileProperties = false,
): KlaviyoEventProfile => {
    let profile: KlaviyoEventProfile = {};
    if (order.customerEmail) {
        profile.$email = order.customerEmail;
    }
    if (order.customerId) {
        profile.$id = order.customerId;
    }
    if (updateAdditionalProfileProperties) {
        if (order.billingAddress) {
            const location = customerMapper.mapCTAddressToKlaviyoLocation(order.billingAddress, true);
            if (location) {
                profile = {
                    ...profile,
                    ...location,
                };
            }
        }
    }
    return profile;
};
