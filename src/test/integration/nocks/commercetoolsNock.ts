import nock from 'nock';
import { Address, CustomFields } from '@commercetools/platform-sdk';
import { ctGet2Orders } from '../../testData/ctGetOrders';

export const ctAuthNock = (times = 1) => {
    return nock('https://auth.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .post(
            '/oauth/token',
            'grant_type=client_credentials&scope=view_orders:klaviyo-dev view_published_products:klaviyo-dev view_products:klaviyo-dev manage_key_value_documents:klaviyo-dev view_customers:klaviyo-dev view_payments:klaviyo-dev',
        )
        .times(times)
        .reply(200, {}, []);
};

export const ctGetCustomerNock = (
    customerId: string,
    responseStatusCode = 200,
    { addresses = [], custom }: { addresses?: Address[]; custom?: CustomFields } = {},
) => {
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
                custom,
            },
            [],
        );
};

export const ctGetOrderByIdNock = (orderId: string, status = 200) => {
    return nock('https://api.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .persist()
        .get(`/klaviyo-dev/orders/${orderId}`)
        .reply(status, {
            customerId: '123-123-123',
            customerEmail: 'test@klaviyo.com',
            id: `${orderId}`,
            version: 24,
            createdAt: '2023-01-27T15:00:00.000Z',
            lastModifiedAt: '2023-01-27T15:00:00.000Z',
            lineItems: [{
                ...ctGet2Orders.results[0].lineItems[0],
            }],
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
            expand: 'paymentInfo.payments[*]',
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
                    lineItems: [{
                        ...ctGet2Orders.results[0].lineItems[0],
                    }],
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
                                obj: {
                                    transactions: [
                                        {
                                            id: '1213456',
                                            amount: {
                                                type: 'centPrecision',
                                                currencyCode: 'EUR',
                                                centAmount: 1300,
                                                fractionDigits: 2,
                                            },
                                            type: 'Refund',
                                            state: 'Success',
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        });
};

export const ctGetCustomObjectNock = (responseCode = 404, key: string, body?: any) => {
    return nock('https://api.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .get(`/klaviyo-dev/custom-objects/klaviyo-ct-plugin-lock/${key}`)
        .reply(responseCode, body);
};

export const ctPostCustomObjectNock = (key: string) => {
    return nock('https://api.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .post('/klaviyo-dev/custom-objects', { container: 'klaviyo-ct-plugin-lock', key: `${key}`, value: '1' })
        .reply(201, {
            id: '6d727995-9944-4caf-8e52-393aa1cca641',
            version: 1,
            versionModifiedAt: '2023-03-01T13:24:29.810Z',
            createdAt: '2023-03-01T13:24:29.810Z',
            lastModifiedAt: '2023-03-01T13:24:29.810Z',
            lastModifiedBy: { clientId: 'xgL4O7sybQE5i75P-n_Hojdi', isPlatformClient: false },
            createdBy: { clientId: 'xgL4O7sybQE5i75P-n_Hojdi', isPlatformClient: false },
            container: 'klaviyo-ct-plugin-lock',
            key: 'orderFullSync',
            value: '1',
        });
};

export const ctDeleteCustomObjectNock = (key: string) => {
    return nock('https://api.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .delete(`/klaviyo-dev/custom-objects/klaviyo-ct-plugin-lock/${key}`)
        .reply(200);
};

export const getAllOrders = (responseBody = {}) => {
    return nock('https://api.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .get('/klaviyo-dev/orders')
        .query({ limit: '20', withTotal: 'false', sort: 'id%20asc' })
        .reply(200, responseBody, []);
};

export const getAllCustomers = (responseBody = {}) => {
    return nock('https://api.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .get('/klaviyo-dev/customers')
        .query({ limit: '20', withTotal: 'false', sort: 'id%20asc' })
        .reply(200, responseBody, []);
};

export const getAllCategories = (responseBody = {}) => {
    return nock('https://api.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .get('/klaviyo-dev/categories')
        .query({ limit: '20', withTotal: 'false', sort: 'id%20asc', expand: 'ancestors[*]' })
        .reply(200, responseBody, []);
};

export const ctGetCategoryByIdNock = (categoryId: string, status = 200) => {
    return nock('https://api.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .persist()
        .get(`/klaviyo-dev/categories/${categoryId}`)
        .query({ expand: 'ancestors[*]' })
        .reply(status, {
            id: categoryId,
            version: 1,
            versionModifiedAt: '2023-03-16T15:01:26.922Z',
            lastMessageSequenceNumber: 1,
            createdAt: '2023-03-16T15:01:26.922Z',
            lastModifiedAt: '2023-03-16T15:01:26.922Z',
            name: { en: 'MessageTriggerTest1' },
            slug: { en: 'message-trigger-test-11' },
            ancestors: [],
            orderHint: '0.1',
            assets: [],
        });
};

export const getAllProducts = (responseBody = {}) => {
    return nock('https://api.us-central1.gcp.commercetools.com:443', { encodedQueryParams: true })
        .get('/klaviyo-dev/products')
        .query({
            limit: '20',
            withTotal: 'false',
            sort:'id%20asc',
            expand: 'masterData.current.categories[*].ancestors[*]',
            where: 'masterData(published = true)',
        })
        .reply(200, responseBody, []);
};

export const getProductsByIdRange = (ids: string[], responseBody = {}) => {
    return nock('https://api.us-central1.gcp.commercetools.com:443', { encodedQueryParams: false })
        .persist()
        .get('/klaviyo-dev/products')
        .query({
            limit: '20',
            withTotal: 'false',
            sort:'id asc',
            expand: 'masterData.current.categories[*].ancestors[*]',
            where: `id in ("${ids.join('","')}")`,
        })
        .reply(200, responseBody, []);
};
