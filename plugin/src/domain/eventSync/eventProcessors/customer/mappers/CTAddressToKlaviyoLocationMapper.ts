import { Address } from '@commercetools/platform-sdk';
import { KlaviyoLocation } from '../../../../../types/klaviyo-types';

export const mapCTAddressToKlaviyoLocation = (address?: Address): KlaviyoLocation | null => {
    return address
        ? {
              address1: getAddressLine1(address),
              address2: getAddressLine2(address),
              city: address.city,
              country: address.country,
              region: address.region,
              zip: address.postalCode,
          }
        : null;
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
