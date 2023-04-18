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
