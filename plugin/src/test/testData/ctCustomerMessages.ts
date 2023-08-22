import {
    CustomerAddressAddedMessage,
    CustomerAddressChangedMessage,
    CustomerAddressRemovedMessage,
    CustomerCompanyNameSetMessage,
    CustomerCreatedMessage,
    CustomerFirstNameSetMessage,
    CustomerLastNameSetMessage,
    CustomerTitleSetMessage,
} from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import { Address, ResourceUpdatedDeliveryPayload } from '@commercetools/platform-sdk';

export const getSampleCustomerCreatedMessage = () => {
    return { ...sampleCustomerCreatedMessage };
};

export const getSampleCustomerAddressUpdateMessage = (
    address?: Address,
): CustomerAddressAddedMessage | CustomerAddressRemovedMessage | CustomerAddressChangedMessage => {
    if (!address) {
        return { ...sampleCustomerAddressUpdateMessage };
    }
    return { ...sampleCustomerAddressUpdateMessage, address: { ...address } };
};

export const getSampleCustomerFirstNameSetMessage = () => {
    return { ...sampleCustomerFirstNameSetMessage };
};

export const getSampleCustomerLastNameSetMessage = () => {
    return { ...sampleCustomerLastNameSetMessage };
};

export const getSampleCustomerTitleSetMessage = () => {
    return { ...sampleCustomerTitleSetMessage };
};

export const getSampleCustomerCompanyNameSetMessage = () => {
    return { ...sampleCustomerCompanyNameSetMessage };
};

export const getSampleCustomerResourceUpdatedMessage = () => {
    return { ...sampleCustomerResourceUpdatedMessage };
};

const sampleCustomerCreatedMessage: CustomerCreatedMessage = {
    customer: {
        title: 'Mr',
        stores: [],
        isEmailVerified: false,
        salutation: '',
        middleName: 'Paul',
        lastModifiedAt: '2023-01-20T09:39:21.359Z',
        version: 1,
        id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
        lastName: 'Smith',
        password: '****7no=',
        createdAt: '2023-01-20T09:39:21.359Z',
        authenticationMode: 'Password',
        firstName: 'Roberto',
        companyName: 'Klaviyo',
        addresses: [
            {
                id: '1235aa3a-5417-4b51-a76c-d6721472531f',
                region: 'aRegion',
                city: 'London',
                country: 'UK',
                phone: '+4407476588266',
                postalCode: 'WE1 2DP',
                streetName: 'High Road',
                streetNumber: '23',
                additionalStreetInfo: 'private access',
                building: 'Tall Tower',
                apartment: 'C',
                additionalAddressInfo: 'additional address info',
                state: 'a state',
            },
        ],
        email: 'roberto.smith@klaviyo.com',
        shippingAddressIds: [],
        billingAddressIds: [],
    },
    resourceUserProvidedIdentifiers: {},
    createdAt: '2023-01-20T09:39:21.359Z',
    lastModifiedAt: '2023-01-20T09:39:21.359Z',
    resourceVersion: 1,
    sequenceNumber: 1,
    resource: {
        id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
        typeId: 'customer',
    },
    version: 1,
    id: '60809018-034b-4b37-bcd7-635fa2591d92',
    type: 'CustomerCreated',
};

const sampleCustomerAddressUpdateMessage:
    | CustomerAddressAddedMessage
    | CustomerAddressRemovedMessage
    | CustomerAddressChangedMessage = {
    address: {
        id: '1235aa3a-5417-4b51-a76c-d6721472531f',
        region: 'aRegion',
        city: 'London',
        country: 'UK',
        phone: '+4407476588266',
        postalCode: 'WE1 2DP',
        streetName: 'High Road',
        streetNumber: '23',
        additionalStreetInfo: 'private access',
        building: 'Tall Tower',
        apartment: 'C',
        additionalAddressInfo: 'additional address info',
        state: 'a state',
    },
    resourceUserProvidedIdentifiers: {},
    createdAt: '2023-01-20T09:39:21.359Z',
    lastModifiedAt: '2023-01-20T09:39:21.359Z',
    resourceVersion: 1,
    sequenceNumber: 1,
    resource: {
        id: '77d8e6f4-2dee-4ac9-bd21-4035b6ba76d8',
        typeId: 'customer',
    },
    version: 1,
    id: '60809018-034b-4b37-bcd7-635fa2591d92',
    type: 'CustomerAddressChanged',
};

const sampleCustomerFirstNameSetMessage: CustomerFirstNameSetMessage = {
    firstName: 'Bob',
    resourceUserProvidedIdentifiers: {},
    createdAt: '2023-01-20T09:39:21.359Z',
    lastModifiedAt: '2023-01-20T09:39:21.359Z',
    resourceVersion: 1,
    sequenceNumber: 1,
    resource: {
        id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
        typeId: 'customer',
    },
    version: 1,
    id: '60809018-034b-4b37-bcd7-635fa2591d92',
    type: 'CustomerFirstNameSet',
};

const sampleCustomerLastNameSetMessage: CustomerLastNameSetMessage = {
    lastName: 'Dylan',
    resourceUserProvidedIdentifiers: {},
    createdAt: '2023-01-20T09:39:21.359Z',
    lastModifiedAt: '2023-01-20T09:39:21.359Z',
    resourceVersion: 1,
    sequenceNumber: 1,
    resource: {
        id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
        typeId: 'customer',
    },
    version: 1,
    id: '60809018-034b-4b37-bcd7-635fa2591d92',
    type: 'CustomerLastNameSet',
};

const sampleCustomerTitleSetMessage: CustomerTitleSetMessage = {
    title: 'Mr',
    resourceUserProvidedIdentifiers: {},
    createdAt: '2023-01-20T09:39:21.359Z',
    lastModifiedAt: '2023-01-20T09:39:21.359Z',
    resourceVersion: 1,
    sequenceNumber: 1,
    resource: {
        id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
        typeId: 'customer',
    },
    version: 1,
    id: '60809018-034b-4b37-bcd7-635fa2591d92',
    type: 'CustomerTitleSet',
};

const sampleCustomerCompanyNameSetMessage: CustomerCompanyNameSetMessage = {
    companyName: 'Klaviyo',
    resourceUserProvidedIdentifiers: {},
    createdAt: '2023-01-20T09:39:21.359Z',
    lastModifiedAt: '2023-01-20T09:39:21.359Z',
    resourceVersion: 1,
    sequenceNumber: 1,
    resource: {
        id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
        typeId: 'customer',
    },
    version: 1,
    id: '60809018-034b-4b37-bcd7-635fa2591d92',
    type: 'CustomerCompanyNameSet',
};

const sampleCustomerResourceUpdatedMessage: ResourceUpdatedDeliveryPayload = {
    version: 6,
    projectKey: 'klaviyo-dev',
    resource: {
        typeId: 'customer',
        id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
    },
    modifiedAt: '2023-02-06T16:13:23.528Z',
    notificationType: 'ResourceUpdated',
    resourceUserProvidedIdentifiers: {
        key: 'testcustomer',
    },
    oldVersion: 5,
};
