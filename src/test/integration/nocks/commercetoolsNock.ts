import nock from 'nock';
import { Address } from '@commercetools/platform-sdk';

export const ctAuthNock = () => {
    return nock('https://auth.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .post(
            '/oauth/token',
            'grant_type=client_credentials&scope=view_customers:klaviyo-dev view_products:klaviyo-dev view_orders:klaviyo-dev',
        )
        .reply(200, {}, []);
};

export const ctGetCustomerNock = (customerId: string, responseStatusCode = 200, addresses: Address[] = []) => {
    return nock('https://api.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .persist()
        .get(`/klaviyo-dev/customers/${customerId}`)
        .reply(
            responseStatusCode,
            {
                id: customerId,
                version: 1,
                versionModifiedAt: '2023-01-20T09:39:21.359Z',
                lastMessageSequenceNumber: 1,
                createdAt: '2023-01-20T09:39:21.359Z',
                lastModifiedAt: '2023-01-20T09:39:21.359Z',
                lastModifiedBy: {
                    isPlatformClient: true,
                    user: {
                        typeId: 'user',
                        id: 'bf334730-755c-4c0f-8703-3954b9f0393a',
                    },
                },
                createdBy: {
                    isPlatformClient: true,
                    user: {
                        typeId: 'user',
                        id: 'bf334730-755c-4c0f-8703-3954b9f0393a',
                    },
                },
                email: 'roberto.smith@klaviyo.com',
                firstName: 'Roberto',
                lastName: 'Smith',
                middleName: '',
                title: 'Mr',
                salutation: '',
                password: '****7no=',
                companyName: 'Klaviyo',
                addresses: addresses,
                shippingAddressIds: [],
                billingAddressIds: [],
                isEmailVerified: false,
                stores: [],
                authenticationMode: 'Password',
            },
            [],
        );
};

export const ctGetOrderByIdNock = (orderId: string, status = 200) => {
    return nock(/https:\/\/api\..*\.gcp.commercetools\.com:443/, { encodedQueryParams: true })
        .persist()
        .get(`/klaviyo-dev/orders/${orderId}`)
        .reply(status, {
            customerId: '123-123-123',
            customerEmail: 'test@klaviyo.com',
            id: `${orderId}`,
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
        });
};

export const ctGetPaymentByIdNock = (paymentId: string, responseStatusCode = 200) => {
    return nock('https://api.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .get(`/klaviyo-dev/payments/${paymentId}`)
        .reply(responseStatusCode, {
            id: paymentId,
            createdAt: '2023-02-16T22:45:59.072Z',
            lastModifiedAt: '2023-02-16T22:49:47.526Z',
            key: '123458',
            interfaceId: '789013',
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
                    state: 'Success',
                },
                {
                    id: '123456',
                    type: 'Refund',
                    amount: {
                        type: 'centPrecision',
                        currencyCode: 'EUR',
                        centAmount: 1000,
                        fractionDigits: 2,
                    },
                    state: 'Initial',
                },
            ],
        });
};

export const ctGetOrderByPaymentIdNock = (paymentId: string, responseStatusCode = 200) => {
    return nock('https://api.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .get('/klaviyo-dev/orders')
        .query({
            limit: '1',
            where: `paymentInfo%28payments%28id%20%3D%20%22${paymentId}%22%29%29`,
        })
        .reply(responseStatusCode, {
            results: [
                {
                    type: 'Order',
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
                                id: paymentId,
                            },
                        ],
                    },
                },
            ],
        });
};
