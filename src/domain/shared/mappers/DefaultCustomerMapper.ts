import { Address, Customer } from '@commercetools/platform-sdk';
import { CustomerMapper } from './CustomerMapper';

const E_164_REGEX = /^\+[1-9]\d{10,14}$/;

export class DefaultCustomerMapper implements CustomerMapper {
    public mapCtCustomerToKlaviyoProfile(customer: Customer, klaviyoProfileId?: string): ProfileRequest {
        const address = this.getCTCustomerAddressForKlaviyo(customer);
        const {
            email,
            firstName: first_name,
            lastName: last_name,
            title,
            companyName: organization,
            id: external_id,
        } = customer;

        return {
            data: {
                type: 'profile',
                id: klaviyoProfileId,
                attributes: {
                    email,
                    external_id,
                    first_name,
                    last_name,
                    title,
                    phone_number: this.getPhoneNumber(address),
                    organization,
                    location: this.mapCTAddressToKlaviyoLocation(address),
                },
            },
        };
    }

    public mapCTAddressToKlaviyoLocation(address?: Address): KlaviyoLocation | null {
        return address
            ? {
                  address1: this.getAddressLine1(address),
                  address2: this.getAddressLine2(address),
                  city: address.city,
                  country: address.country,
                  region: address.region,
                  zip: address.postalCode,
              }
            : null;
    }

    public getAddressLine1(address?: Address): string | null{
        return address
            ? [address.apartment, address.building, address.streetNumber, address.streetName]
                  .filter((element) => element)
                  .join(', ')
            : null;
    }

    public getAddressLine2(address?: Address): string | null {
        return address
            ? [address.additionalStreetInfo, address.additionalAddressInfo].filter((element) => element).join(', ')
            : null;
    }

    public getPhoneNumber(address?: Address): string | null {
        const phoneNumber = address?.mobile || address?.phone;
        if (phoneNumber) {
            const noSpacesAndDashPhoneNumber = phoneNumber.replace(/\s|-|\/|\)|\(|\*|[a-z]|[A-Z]+/g, '');
            return E_164_REGEX.test(noSpacesAndDashPhoneNumber) ? noSpacesAndDashPhoneNumber : null;
        }
        return null;
    }

    /**
     * A CT customer can have multiple addresses, klaviyo accepts only one address information in the location field.
     * This method selects one of the CT addresses to be used to populate the klaviyo location info for a klaviyo profile.
     * The address selection evaluates in order the following conditions and returns the first address found:
     * 1. Selects the customer defaultBillingAddress if set
     * 2. Selects the first available billing address if present
     * 3. Selects the first available address if present
     * @param customer
     */
    public getCTCustomerAddressForKlaviyo(customer: Customer): Address | undefined {
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
    }
}
