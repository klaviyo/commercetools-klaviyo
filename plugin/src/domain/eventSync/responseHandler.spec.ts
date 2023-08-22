import { responseHandler } from './responseHandler';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { mockDeep } from 'jest-mock-extended';
import { expect } from 'chai';
import { KlaviyoError } from '../../test/utils/KlaviyoError';

describe('responseHandler', () => {
    test('should return status OK when all promises are fulfilled', async () => {
        const promises = [
            new Promise((resolve) => {
                resolve('something');
            }),
        ];
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        const results = await Promise.allSettled(promises);

        const response = responseHandler(results, ctMessageMock);
        expect(response).to.deep.eq({ status: 'OK' });
    });

    test('should return status OK when no promises are passed in', async () => {
        const results = await Promise.allSettled([]);

        const response = responseHandler(results, mockDeep<MessageDeliveryPayload>());
        expect(response).to.deep.eq({ status: 'OK' });
    });

    test('should return status 4xx when klaviyo returns status code 4xx', async () => {
        const promises = [
            new Promise((resolve) => {
                resolve('something');
            }),
            new Promise((resolve, reject) => {
                reject(new KlaviyoError(400));
            }),
        ];
        const results = await Promise.allSettled(promises);

        const response = responseHandler(results, mockDeep<MessageDeliveryPayload>());
        expect(response).to.deep.eq({ status: '4xx' });
    });

    test('should throw error when klaviyo returns 5xx or any other error', async () => {
        const promises = [
            new Promise((resolve) => {
                resolve('something');
            }),
            new Promise((resolve, reject) => {
                reject(new KlaviyoError(500));
            }),
        ];
        const results = await Promise.allSettled(promises);

        expect(() => responseHandler(results, mockDeep<MessageDeliveryPayload>())).to.throw(Error);
    });

    test('should throw error when klaviyo process multiple requests and returns at least one 5xx and one or more 4xx status codes', async () => {
        const promises = [
            new Promise((resolve) => {
                resolve('something');
            }),
            new Promise((resolve, reject) => {
                reject(new KlaviyoError(500));
            }),
            new Promise((resolve, reject) => {
                reject(new KlaviyoError(400));
            }),
        ];
        const results = await Promise.allSettled(promises);

        expect(() => responseHandler(results, mockDeep<MessageDeliveryPayload>())).to.throw(Error);
    });
});
