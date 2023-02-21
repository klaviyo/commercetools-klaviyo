import { AuthMiddlewareOptions, Client, ClientBuilder, HttpMiddlewareOptions } from '@commercetools/sdk-client-v2';
import { ApiRoot, Payment, createApiBuilderFromCtpClient, Customer, Order } from '@commercetools/platform-sdk'
import logger from '../utils/log';
import fetch from 'node-fetch';
import { StatusError } from '../types/errors/StatusError';

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

export const getCustomerProfile = async (customerId: string): Promise<Customer> => {
    logger.info(`Getting customer ${customerId} in commercetools`);

    try {
        return (await getApiRoot().customers().withId({ ID: customerId }).get().execute()).body;
    } catch (error: any) {
        logger.error(`Error getting customer in CT with id ${customerId}, status: ${error.statusCode}`, error);
        throw new StatusError(
            error.statusCode,
            `CT get customer api returns failed with status code ${error.statusCode}, msg: ${error.message}`,
        );
    }
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

export const getOrderByPaymentId = async (paymentId: string): Promise<Order> => {
    logger.info(`Getting order with payment ${paymentId} in commercetools`);

    try {
        const orderResults = (await getApiRoot().orders().get({
            queryArgs: {
                limit: 1,
                where: `paymentInfo(payments(id = "${paymentId}"))`
            }
        }).execute()).body?.results;
        if (!orderResults?.length) {
            throw new StatusError(
                404,
                `No results returned when querying orders with payment ID ${paymentId}`,
            );
        }
        return orderResults[0];
    } catch (error: any) {
        logger.error(`Error getting order in CT with payment id ${paymentId}, status: ${error.status || error.statusCode}`, error);
        throw new StatusError(
            error.statusCode,
            `CT get order by payment id api returns failed with status code ${error.status || error.statusCode}, msg: ${error.message}`,
        );
    }
};

export const getPaymentById = async (paymentId: string): Promise<Payment> => {
    logger.info(`Getting payment ${paymentId} in commercetools`);
    let ctPayment: Payment;

    try {
        ctPayment = (await getApiRoot().payments().withId({ ID: paymentId }).get().execute()).body;
    } catch (error: any) {
        logger.error(`Error getting payment in CT with id ${paymentId}, status: ${error.statusCode}`, error);
        throw new StatusError(
            error.statusCode,
            `CT get payment api returns failed with status code ${error.statusCode}, msg: ${error.message}`,
        );
    }

    return ctPayment;
};
