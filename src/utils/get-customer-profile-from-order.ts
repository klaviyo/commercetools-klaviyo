import { Order } from '@commercetools/platform-sdk';

export const getCustomerProfileFromOrder = (order: Order): KlaviyoEventProfile => {
    const profile: KlaviyoEventProfile = {};
    if (order.customerEmail) {
        profile.$email = order.customerEmail;
    }
    if (order.customerId) {
        profile.$id = order.customerId;
    }
    return profile;
};
