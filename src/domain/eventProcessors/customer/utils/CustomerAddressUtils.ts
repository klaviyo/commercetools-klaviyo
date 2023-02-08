import { Address, Customer } from '@commercetools/platform-sdk';

const E_164_REGEX = /^\+[1-9]\d{10,14}$/;

export const getPhoneNumber = (address?: Address): string | null => {
    const phoneNumber = address?.mobile || address?.phone;
    if (phoneNumber) {
        const noSpacesAndDashPhoneNumber = phoneNumber.replace(/\s|-|\/|\)|\(|\*|[a-z]|[A-Z]+/g, '');
        return E_164_REGEX.test(noSpacesAndDashPhoneNumber) ? noSpacesAndDashPhoneNumber : null;
    }
    return null;
};

/**
 * A CT customer can have multiple addresses, klaviyo accepts only one address information in the location field.
 * This method selects one of the CT addresses to be used to populate the klaviyo location info for a klaviyo profile.
 * The address selection evaluates in order the following conditions and returns the first address found:
 * 1. Selects the customer defaultBillingAddress if set
 * 2. Selects the first available billing address if present
 * 3. Selects the first available address if present
 * @param customer
 */
export const getCTCustomerAddressForKlaviyo = (customer: Customer): Address | undefined => {
    if (!customer || !customer.addresses.length) {
        return;
    }
    if (customer.defaultBillingAddressId) {
        return customer.addresses?.find((address) => address.id === customer.defaultBillingAddressId);
    }
    if (customer?.billingAddressIds?.length) {
        return customer.addresses?.find((address) => address.id === customer?.billingAddressIds?.find(() => true));
    }
    return customer.addresses?.find(() => true);
};
