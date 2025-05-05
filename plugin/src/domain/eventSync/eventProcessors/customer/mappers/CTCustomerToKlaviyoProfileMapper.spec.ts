import { Customer } from '@commercetools/platform-sdk';
import { mapCTCustomerToKlaviyoProfile } from './CTCustomerToKlaviyoProfileMapper';

describe('mapCTCustomerToKlaviyoProfile', () => {
    it('maps a simple CT customer object to a Klaviyo profile', () => {
        const klaviyoProfile = mapCTCustomerToKlaviyoProfile({
            email: 'john.doe@e2x.com',
            firstName: 'John',
            lastName: 'Doe',
            title: 'Mr',
            addresses: [],
            companyName: 'some organisation',
            id: 'some-id',
        } as unknown as Customer);

        expect(klaviyoProfile).toEqual({
            email: 'john.doe@e2x.com',
            external_id: 'some-id',
            first_name: 'John',
            last_name: 'Doe',
            title: 'Mr',
            phone_number: null,
            organization: 'some organisation',
            location: null,
        });
    });

    it('includes custom fields if present', () => {
        const klaviyoProfile = mapCTCustomerToKlaviyoProfile({
            email: 'john.doe@e2x.com',
            firstName: 'John',
            lastName: 'Doe',
            title: 'Mr',
            addresses: [
                {
                    city: 'City',
                    country: 'Country',
                    region: 'Region',
                    postalCode: 'Zip',
                },
            ],
            companyName: 'some organisation',
            id: 'some-id',
            custom: {
                type: {
                    typeId: 'type',
                    id: 'someType',
                },
                fields: {
                    customField1: 'value1',
                    customField2: {
                        nested: 'value',
                    },
                },
            },
        } as unknown as Customer);

        expect(klaviyoProfile).toEqual({
            email: 'john.doe@e2x.com',
            external_id: 'some-id',
            first_name: 'John',
            last_name: 'Doe',
            title: 'Mr',
            phone_number: null,
            organization: 'some organisation',
            location: {
                address1: '',
                address2: '',
                city: 'City',
                country: 'Country',
                region: 'Region',
                zip: 'Zip',
            },
            properties: {
                customField1: 'value1',
                customField2: {
                    nested: 'value',
                },
            },
        });
    });

    it('includes location with address if present', () => {
        const klaviyoProfile = mapCTCustomerToKlaviyoProfile({
            email: 'john.doe@e2x.com',
            firstName: 'John',
            lastName: 'Doe',
            title: 'Mr',
            addresses: [
                {
                    city: 'City',
                    country: 'Country',
                    region: 'Region',
                    postalCode: 'Zip',
                    apartment: 'Apartment',
                    building: 'Building',
                    streetNumber: '1st',
                    streetName: 'Street Name',
                    additionalStreetInfo: 'Before 2nd street',
                    additionalAddressInfo: 'By the hardware store',
                },
            ],
            companyName: 'some organisation',
            id: 'some-id',
            custom: {
                type: {
                    typeId: 'type',
                    id: 'someType',
                },
                fields: {
                    customField1: 'value1',
                    customField2: {
                        nested: 'value',
                    },
                },
            },
        } as unknown as Customer);

        expect(klaviyoProfile).toEqual({
            email: 'john.doe@e2x.com',
            external_id: 'some-id',
            first_name: 'John',
            last_name: 'Doe',
            title: 'Mr',
            phone_number: null,
            organization: 'some organisation',
            location: {
                address1: 'Apartment, Building, 1st, Street Name',
                address2: 'Before 2nd street, By the hardware store',
                city: 'City',
                country: 'Country',
                region: 'Region',
                zip: 'Zip',
            },
            properties: {
                customField1: 'value1',
                customField2: {
                    nested: 'value',
                },
            },
        });
    });
});
