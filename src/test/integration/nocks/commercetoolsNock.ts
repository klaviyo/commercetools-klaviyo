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
