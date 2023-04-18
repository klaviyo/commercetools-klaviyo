import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { ByProjectKeyPaymentsRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/payments/by-project-key-payments-request-builder';
import { ByProjectKeyPaymentsByIDRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/payments/by-project-key-payments-by-id-request-builder';
import { ApiRequest } from '@commercetools/platform-sdk/dist/declarations/src/generated/shared/utils/requests-utils';
import { Payment, PaymentPagedQueryResponse } from '@commercetools/platform-sdk';
import { CTErrorResponse } from '../../../test/utils/CTErrorResponse';
import { DefaultCtPaymentService } from './DefaultCtPaymentService';
import * as ctService from './ctService';

jest.mock('./ctService', () => {
    return {
        getApiRoot: jest.fn(),
    };
});

const mockCtApiRoot: DeepMockProxy<ByProjectKeyRequestBuilder> = mockDeep<ByProjectKeyRequestBuilder>();
const paymentsMock: DeepMockProxy<ByProjectKeyPaymentsRequestBuilder> = mockDeep<ByProjectKeyPaymentsRequestBuilder>()

mockCtApiRoot.payments.mockImplementation(() => paymentsMock)
const mockGetCustomObjectApiPagedRequest: DeepMockProxy<ApiRequest<PaymentPagedQueryResponse>> = mockDeep<ApiRequest<PaymentPagedQueryResponse>>();
const mockGetCustomObjectApiRequest: DeepMockProxy<ApiRequest<Payment>> = mockDeep<ApiRequest<Payment>>();
const paymentsWithIdMock = mockDeep<ByProjectKeyPaymentsByIDRequestBuilder>();
paymentsMock.withId.mockImplementation(() => paymentsWithIdMock);
paymentsWithIdMock.get.mockImplementation(() => mockGetCustomObjectApiRequest);

paymentsMock.get.mockImplementation(() => mockGetCustomObjectApiPagedRequest);

describe('getPaymentById', () => {
    it('should return an payment from CT', async () => {
        mockGetCustomObjectApiRequest.execute.mockResolvedValueOnce({
            body: mock<Payment>()
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctPaymentService = new DefaultCtPaymentService(mockCtApiRoot);
        await ctPaymentService.getPaymentById('123456');

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    });

    it('should return undefined if fails to get payments from CT APIs', async () => {
        mockGetCustomObjectApiRequest.execute.mockImplementation(() => {
            throw new CTErrorResponse(504, 'CT Error');
        });
        jest.spyOn(ctService, 'getApiRoot').mockImplementation((() => mockCtApiRoot));

        const ctPaymentService = new DefaultCtPaymentService(mockCtApiRoot);
        await expect(ctPaymentService.getPaymentById('123456')).rejects.toThrow(Error);

        expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    });
});