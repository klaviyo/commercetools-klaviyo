import { Address, Customer } from '@commercetools/platform-sdk';

export const sampleCustomerApiResponse: Customer = {
    id: '77d8e6f4-2dee-4ac9-bd21-4035b6ba76d8',
    version: 1,
    createdAt: '2023-02-01T14:14:56.605Z',
    lastModifiedAt: '2023-02-01T14:14:56.605Z',
    lastModifiedBy: {
        clientId: '3bdbmCvX60kN6G-HfzLxcmlB',
    },
    createdBy: {
        clientId: '3bdbmCvX60kN6G-HfzLxcmlB',
    },
    email: 'Alfred_Lebsack@hotmail.com',
    firstName: 'Jailyn',
    lastName: 'Hilll',
    title: 'Miss',
    password: '****bpU=',
    addresses: [
        {
            id: 'M5Q94Hg5',
            title: 'Mrs.',
            firstName: 'Coleman',
            lastName: 'Pouros',
            streetName: 'First Street',
            streetNumber: '12',
            postalCode: '12345',
            city: 'Brookefort',
            country: 'NL',
            phone: '+39 3234567892',
            mobile: '+39 3234567892',
            email: 'jane.doe@example.com',
        },
        {
            id: 'VnDQjIJZ',
            title: 'Head of factory',
            firstName: 'Jane',
            lastName: 'Doe',
            streetName: 'Third Street',
            streetNumber: '34',
            postalCode: '12345',
            city: 'Example City',
            country: 'NL',
            phone: '+3112345678',
            mobile: '+3112345679',
            email: 'jane.doe@example.com',
        },
    ],
    shippingAddressIds: [],
    billingAddressIds: [],
    isEmailVerified: false,
    key: 'testcustomer',
    stores: [],
    authenticationMode: 'Password',
};

export const getSampleCustomerApiResponse = (addresses?: Address[]): Customer => {
    if (!addresses) {
        return { ...sampleCustomerApiResponse };
    } else {
        return { ...sampleCustomerApiResponse, addresses: { ...addresses } };
    }
};
