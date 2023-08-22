import { PaymentCreatedMessage, PaymentTransactionAddedMessage } from '@commercetools/platform-sdk';

export const samplePaymentCreatedMessage: PaymentCreatedMessage = {
    id: 'efdeee65-81d4-4004-8a04-b0d3428585e4',
    version: 1,
    sequenceNumber: 1,
    resource: {
        typeId: 'payment',
        id: '3456789',
    },
    resourceVersion: 1,
    resourceUserProvidedIdentifiers: {
        key: '123456',
    },
    type: 'PaymentCreated',
    payment: {
        id: '3456789',
        version: 1,
        createdAt: '2023-02-08T13:55:02.247Z',
        lastModifiedAt: '2023-02-08T13:55:02.247Z',
        key: '123456',
        interfaceId: '789011',
        amountPlanned: {
            type: 'centPrecision',
            currencyCode: 'USD',
            centAmount: 1000,
            fractionDigits: 2,
        },
        paymentMethodInfo: {
            paymentInterface: 'STRIPE',
            method: 'CREDIT_CARD',
            name: {
                en: 'Credit Card',
            },
        },
        paymentStatus: {},
        transactions: [
            {
                id: '123456',
                timestamp: '2015-10-20T08:54:24.000Z',
                type: 'Refund',
                amount: {
                    type: 'centPrecision',
                    currencyCode: 'USD',
                    centAmount: 1000,
                    fractionDigits: 2,
                },
                state: 'Initial',
            },
        ],
        interfaceInteractions: [],
    },
    createdAt: '2023-02-08T13:55:02.247Z',
    lastModifiedAt: '2023-02-08T13:55:02.247Z',
};

export const samplePaymentTransactionAddedMessage: PaymentTransactionAddedMessage = {
    id: '356789',
    version: 1,
    sequenceNumber: 2,
    resource: {
        typeId: 'payment',
        id: '3456789',
    },
    resourceVersion: 2,
    resourceUserProvidedIdentifiers: {
        key: '123456',
    },
    type: 'PaymentTransactionAdded',
    transaction: {
        id: '123456',
        type: 'Refund',
        amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 4000,
            fractionDigits: 2,
        },
        state: 'Initial',
    },
    createdAt: '2023-01-18 09:23:00',
    lastModifiedAt: '2023-01-18 09:23:00',
};
