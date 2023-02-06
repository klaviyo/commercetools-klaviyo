import { Address, Customer } from '@commercetools/platform-sdk';

const E_164_REGEX = /^\+[1-9]\d{10,14}$/;

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

export const mapCTAddressToKlaviyoLocation = (address?: Address): KlaviyoLocation | null => {
    return address
        ? {
              address1: getAddressLine1(address),
              address2: getAddressLine2(address),
              city: address?.city,
              country: address?.country,
              region: address?.region,
              zip: address?.postalCode,
          }
        : null;
};

export const getPhoneNumber = (address?: Address): string | null => {
    const phoneNumber = address?.mobile || address?.phone;
    if (phoneNumber) {
        const noSpacesNumber = phoneNumber.replace(/\s/, '');
        return E_164_REGEX.test(noSpacesNumber) ? noSpacesNumber : null;
    }
    return null;
};

const getAddressLine1 = (address?: Address): string | null => {
    return address
        ? [address.apartment, address.building, address.streetNumber, address.streetName]
              .filter((element) => element)
              .join(', ')
        : null;
};

const getAddressLine2 = (address?: Address): string | null => {
    return address
        ? [address.additionalStreetInfo, address.additionalAddressInfo].filter((element) => element).join(', ')
        : null;
};
