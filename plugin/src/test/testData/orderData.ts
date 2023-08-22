import {
    OrderCreatedMessage,
    OrderCustomerSetMessage,
    OrderStateChangedMessage,
    ReturnInfoSetMessage,
} from '@commercetools/platform-sdk';

export const sampleOrderCreatedMessage: OrderCreatedMessage = {
    id: '123123123',
    version: 11,
    createdAt: '2023-01-18 09:23:00',
    lastModifiedAt: '2023-01-18 09:23:00',
    sequenceNumber: 245,
    resourceVersion: 23,
    resource: { typeId: 'order', id: '123-456-789' },
    type: 'OrderCreated',
    order: {
        customerId: '123-123-123',
        customerEmail: 'test@klaviyo.com',
        id: '3456789',
        version: 24,
        createdAt: '2023-01-27T15:00:00.000Z',
        lastModifiedAt: '2023-01-27T15:00:00.000Z',
        lineItems: [],
        customLineItems: [],
        totalPrice: { type: 'centPrecision', centAmount: 1300, currencyCode: 'USD', fractionDigits: 2 },
        shipping: [],
        shippingMode: 'Single',
        orderState: 'Open',
        syncInfo: [],
        origin: 'Customer',
        refusedGifts: [],
    },
};

export const sampleOrderStateChangedMessage: OrderStateChangedMessage = {
    id: '123123123',
    version: 11,
    createdAt: '2023-01-18 09:23:00',
    lastModifiedAt: '2023-01-18 09:23:00',
    sequenceNumber: 245,
    resourceVersion: 24,
    resource: { typeId: 'order', id: '3456789' },
    type: 'OrderStateChanged',
    orderState: 'Cancelled',
    oldOrderState: 'Open',
};

export const sampleReturnInfoSetMessage: ReturnInfoSetMessage = {
    id: '123123123',
    version: 11,
    createdAt: '2023-01-18 09:23:00',
    lastModifiedAt: '2023-01-18 09:23:00',
    sequenceNumber: 245,
    resourceVersion: 23,
    resource: { typeId: 'order', id: '3456789' },
    type: 'ReturnInfoSet',
    returnInfo: [
        {
            items: [
                {
                    id: '123-123-123',
                    quantity: 1,
                    paymentState: 'Refunded',
                    type: 'LineItemReturnItem',
                    lineItemId: '123-123-123',
                    createdAt: '2023-01-18 09:23:00',
                    lastModifiedAt: '2023-01-18 09:23:00',
                    shipmentState: 'Advised',
                },
            ],
        },
    ],
};

export const sampleOrderCustomerSetMessage: OrderCustomerSetMessage = {
    id: '123123123',
    version: 1,
    sequenceNumber: 2,
    resource: {
        typeId: 'order',
        id: '3456789',
    },
    resourceVersion: 2,
    resourceUserProvidedIdentifiers: {
        orderNumber: '201612010001',
    },
    type: 'OrderCustomerSet',
    customer: {
        typeId: 'customer',
        id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
    },
    createdAt: '2023-02-08T19:35:53.302Z',
    lastModifiedAt: '2023-02-08T19:35:53.302Z',
};

export const sampleOrderWithPaymentMessage: OrderCreatedMessage = {
    id: '123123123',
    version: 11,
    createdAt: '2023-01-18 09:23:00',
    lastModifiedAt: '2023-01-18 09:23:00',
    sequenceNumber: 245,
    resourceVersion: 23,
    resource: { typeId: 'order', id: '123-456-789' },
    type: 'OrderCreated',
    order: {
        id: '3456789',
        createdAt: '2023-01-27T15:00:00.000Z',
        lastModifiedAt: '2023-01-27T15:00:00.000Z',
        customerId: '123-123-123',
        customerEmail: 'test@klaviyo.com',
        totalPrice: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1300,
            fractionDigits: 2,
        },
        orderState: 'Open',
        returnInfo: [],
        lineItems: [],
        customLineItems: [],
        shippingMode: '',
        shipping: [],
        version: 1,
        syncInfo: [],
        origin: '',
        refusedGifts: [],
        paymentInfo: {
            payments: [
                {
                    typeId: 'payment',
                    id: '3456789',
                },
            ],
        },
    },
};
