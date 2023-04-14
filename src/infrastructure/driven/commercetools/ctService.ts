import {
    AuthMiddlewareOptions,
    Client,
    ClientBuilder,
    QueueMiddlewareOptions,
    HttpMiddlewareOptions,
} from '@commercetools/sdk-client-v2';
import { ApiRoot, Payment, createApiBuilderFromCtpClient, Customer, Order } from '@commercetools/platform-sdk'
import logger from '../../../utils/log';
import fetch from 'node-fetch';
import { StatusError } from '../../../types/errors/StatusError';

type ByProjectKeyRequestBuilder = ReturnType<ApiRoot['withProjectKey']>;

let ctClient: Client;

export const getCtClient = (concurrency = 10): Client => {
    if (!ctClient) {
        const ctApiCredentials = JSON.parse(process.env.CT_API_CLIENT || '{"clientId":"","secret":""}');

        if(!process.env.CT_AUTH_URL){
            throw Error("Commercetools Host URL not set in environment variable CT_AUTH_URL. Set the variable and restart the application")
        }
        if(!process.env.CT_PROJECT_ID){
            throw Error("Commercetools Project ID not set in environment variable CT_PROJECT_ID. Set the variable and restart the application")
        }
        if(!process.env.CT_API_URL){
            throw Error("Commercetools API URL not set in environment variable CT_API_URL. Set the variable and restart the application")
        }
        const authMiddlewareOptions: AuthMiddlewareOptions = {
            host: process.env.CT_AUTH_URL,
            projectKey: process.env.CT_PROJECT_ID,
            credentials: {
                clientId: ctApiCredentials.clientId,
                clientSecret: ctApiCredentials.secret,
            },
            scopes: [process.env.CT_SCOPES || ''],
            fetch,
        };

        const httpMiddlewareOptions: HttpMiddlewareOptions = {
            maskSensitiveHeaderData: true,
            host: process.env.CT_API_URL,
            enableRetry: true,
            fetch,
        };

        const queueMiddlewareOptions: QueueMiddlewareOptions = {
            concurrency,
        };

        ctClient = new ClientBuilder()
            .withClientCredentialsFlow(authMiddlewareOptions)
            .withHttpMiddleware(httpMiddlewareOptions)
            .withQueueMiddleware(queueMiddlewareOptions)
            // .withLoggerMiddleware()
            .build();
    }
    return ctClient;
};

export const getApiRoot = (): ByProjectKeyRequestBuilder => {
    return createApiBuilderFromCtpClient(getCtClient()).withProjectKey({
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

//todo move to ctOrderService
export const getOrderById = async (orderId: string): Promise<Order | undefined> => {
    logger.info(`Getting order ${orderId} in commercetools`);
    let ctOrder: Order;

    try {
        ctOrder = (await getApiRoot().orders().withId({ ID: orderId }).get().execute()).body;
    } catch (error) {
        logger.error(error);
        return undefined;
    }

    return ctOrder;
};

//todo move to ctOrderService
export const getOrderByPaymentId = async (paymentId: string): Promise<Order> => {
    logger.info(`Getting order with payment ${paymentId} in commercetools`);

    try {
        const orderResults = (await getApiRoot().orders().get({
            queryArgs: {
                limit: 1,
                where: `paymentInfo(payments(id = "${paymentId}"))`,
                expand: 'paymentInfo.payments[*]',
            },
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

//todo move to ctPaymentService
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
