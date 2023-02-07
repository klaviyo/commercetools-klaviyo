import { AuthMiddlewareOptions, Client, ClientBuilder, HttpMiddlewareOptions } from '@commercetools/sdk-client-v2';
import { ApiRoot, createApiBuilderFromCtpClient, Customer, Order } from '@commercetools/platform-sdk';
import logger from '../utils/log';
import fetch from 'cross-fetch';

type ByProjectKeyRequestBuilder = ReturnType<ApiRoot['withProjectKey']>;

let ctClient: Client;

export const createCtClient = () => {
    if (!ctClient) {
        const ctApiCredentials = JSON.parse(process.env.CT_API_CLIENT || '{"clientId":"","secret":""}');

        const authMiddlewareOptions: AuthMiddlewareOptions = {
            host: process.env.CT_AUTH_URL || '',
            projectKey: process.env.CT_PROJECT_ID || '',
            credentials: {
                clientId: ctApiCredentials.clientId || '',
                clientSecret: ctApiCredentials.secret || '',
            },
            scopes: [process.env.CT_SCOPES || ''],
            fetch,
        };

        const httpMiddlewareOptions: HttpMiddlewareOptions = {
            host: process.env.CT_API_URL || '',
            fetch,
        };

        ctClient = new ClientBuilder()
            .withClientCredentialsFlow(authMiddlewareOptions)
            .withHttpMiddleware(httpMiddlewareOptions)
            // .withLoggerMiddleware()
            .build();
    }
    return ctClient;
};

const getApiRoot = (): ByProjectKeyRequestBuilder => {
    return createApiBuilderFromCtpClient(createCtClient()).withProjectKey({
        projectKey: process.env.CT_PROJECT_ID || '',
    });
};

export const getCustomerProfile = async (customerId: string): Promise<Customer | undefined> => {
    logger.info(`Getting customer ${customerId} in commercetools`);
    let ctCustomer: Customer;

    try {
        ctCustomer = (await getApiRoot().customers().withId({ ID: customerId }).get().execute()).body;
    } catch (error) {
        console.log(error);
        // throw new Error(`Customer not found on commercetools with ID ${customerId}`);
        return undefined;
    }

    return ctCustomer;
};

export const getOrderById = async (orderId: string): Promise<Order | undefined> => {
    logger.info(`Getting order ${orderId} in commercetools`);
    let ctOrder: Order;

    try {
        ctOrder = (await getApiRoot().orders().withId({ ID: orderId }).get().execute()).body;
    } catch (error) {
        console.log(error);
        return undefined;
    }

    return ctOrder;
};
