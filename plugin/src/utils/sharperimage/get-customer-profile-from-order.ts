import { Order } from '@commercetools/platform-sdk';
import { getCustomerProfileFromOrder } from '../get-customer-profile-from-order';
import { SharperImageCustomerMapper } from '../../domain/shared/mappers/sharperimage/SharperImageCustomerMapper';

export const getCustomerProfileFromOrderSharperImage = (
    order: Order,
    customerMapper: SharperImageCustomerMapper,
    updateAdditionalProfileProperties = false,
): KlaviyoEventProfile => {
    const initialProfile = getCustomerProfileFromOrder(order, customerMapper, updateAdditionalProfileProperties);
    const sharperImageProfileData = customerMapper.mapCtAddressToCustomerContact(order.billingAddress);
    return {
        ...initialProfile,
        ...sharperImageProfileData,
    };
};
