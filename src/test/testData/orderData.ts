import { OrderCreatedMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';

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
        createdAt: '2023-01-18 09:23:00',
        lastModifiedAt: '2023-01-18 10:36:00',
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
