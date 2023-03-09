import { CustomersSync } from './CustomersSync';
import { KlaviyoSdkService } from '../../infrastructure/driven/klaviyo/KlaviyoSdkService';
import { CTCustomObjectLockService } from './services/CTCustomObjectLockService';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { Customer } from '@commercetools/platform-sdk';
import { ErrorCodes, StatusError } from '../../types/errors/StatusError';
import { DefaultCtCustomerService } from '../../infrastructure/driven/commercetools/DefaultCtCustomerService';
import { DefaultCustomerMapper } from '../shared/mappers/DefaultCustomerMapper';
import logger from '../../utils/log'

const mockCtCustomObjectLockService: DeepMockProxy<CTCustomObjectLockService> = mockDeep<CTCustomObjectLockService>();
const mockDefaultCustomerMapper: DeepMockProxy<DefaultCustomerMapper> = mockDeep<DefaultCustomerMapper>();
const mockKlaviyoSdkService: DeepMockProxy<KlaviyoSdkService> = mockDeep<KlaviyoSdkService>();
const mockDefaultCtCustomerService: DeepMockProxy<DefaultCtCustomerService> = mockDeep<DefaultCtCustomerService>();

const historicalCustomers = new CustomersSync(
    mockCtCustomObjectLockService,
    mockDefaultCustomerMapper,
    mockKlaviyoSdkService,
    mockDefaultCtCustomerService,
);

describe('syncAllCustomers', () => {
    it('should create a single profile in klaviyo when CT returns a single customer', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockCustomer = mock<Customer>();
        Object.defineProperty(mockCustomer, 'createdAt', { value: '2023-01-27T15:00:00.000Z' });
        mockDefaultCtCustomerService.getAllCustomers.mockResolvedValueOnce({ data: [mockCustomer], hasMore: false });

        await historicalCustomers.syncAllCustomers();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtCustomerService.getAllCustomers).toBeCalledTimes(1);
        expect(mockDefaultCustomerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(1);
        expect(mockDefaultCustomerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledWith(mockCustomer);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(1);
    });

    it('should send 10 profiles to klaviyo when CT returns 10 customers with pagination', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockCustomer = mock<Customer>();
        mockDefaultCtCustomerService.getAllCustomers.mockResolvedValueOnce({
            data: Array(6).fill(mockCustomer),
            hasMore: true,
        });
        mockDefaultCtCustomerService.getAllCustomers.mockResolvedValueOnce({
            data: Array(4).fill(mockCustomer),
            hasMore: false,
        });

        await historicalCustomers.syncAllCustomers();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtCustomerService.getAllCustomers).toBeCalledTimes(2);
        expect(mockDefaultCustomerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(10);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(10);
    });

    it('should not allow to run the customer sync if there is another sync in progress', async () => {
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(409, 'is locked', ErrorCodes.LOCKED);
        });

        await historicalCustomers.syncAllCustomers();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(0);
        expect(mockDefaultCtCustomerService.getAllCustomers).toBeCalledTimes(0);
        expect(mockDefaultCustomerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
    });

    it('should log errors and release lock if an unhandled error is thrown during processing', async () => {
        const errorSpy = jest.spyOn(logger, 'error');
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(500, 'Unknown error', ErrorCodes.UNKNOWN_ERROR);
        });

        await historicalCustomers.syncAllCustomers();

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtCustomerService.getAllCustomers).toBeCalledTimes(0);
        expect(mockDefaultCustomerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
        expect(errorSpy).toBeCalledTimes(1);
    });
});

describe('syncCustomersByIdRange', () => {
    it('should create a single profile in klaviyo when CT returns a single customer', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockCustomer = mock<Customer>();
        Object.defineProperty(mockCustomer, 'createdAt', { value: '2023-01-27T15:00:00.000Z' });
        mockDefaultCtCustomerService.getCustomersByIdRange.mockResolvedValueOnce({ data: [mockCustomer], hasMore: false });

        await historicalCustomers.syncCustomersByIdRange(['123456']);

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtCustomerService.getCustomersByIdRange).toBeCalledTimes(1);
        expect(mockDefaultCustomerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(1);
        expect(mockDefaultCustomerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledWith(mockCustomer);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(1);
    });

    it('should send 10 profiles to klaviyo when CT returns 10 customers with pagination', async () => {
        mockCtCustomObjectLockService.acquireLock.mockResolvedValueOnce();

        const mockCustomer = mock<Customer>();
        mockDefaultCtCustomerService.getCustomersByIdRange.mockResolvedValueOnce({
            data: Array(6).fill(mockCustomer),
            hasMore: true,
        });
        mockDefaultCtCustomerService.getCustomersByIdRange.mockResolvedValueOnce({
            data: Array(4).fill(mockCustomer),
            hasMore: false,
        });

        await historicalCustomers.syncCustomersByIdRange(Array(10).fill('123456'));

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtCustomerService.getCustomersByIdRange).toBeCalledTimes(2);
        expect(mockDefaultCustomerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(10);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(10);
    });

    it('should not allow to run the customer sync if there is another sync in progress', async () => {
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(409, 'is locked', ErrorCodes.LOCKED);
        });

        await historicalCustomers.syncCustomersByIdRange(['123456']);

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(0);
        expect(mockDefaultCtCustomerService.getCustomersByIdRange).toBeCalledTimes(0);
        expect(mockDefaultCustomerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
    });

    it('should log errors and release lock if an unhandled error is thrown during processing', async () => {
        const errorSpy = jest.spyOn(logger, 'error');
        mockCtCustomObjectLockService.acquireLock.mockImplementation(() => {
            throw new StatusError(500, 'Unknown error', ErrorCodes.UNKNOWN_ERROR);
        });

        await historicalCustomers.syncCustomersByIdRange(['123456']);

        expect(mockCtCustomObjectLockService.acquireLock).toBeCalledTimes(1);
        expect(mockCtCustomObjectLockService.releaseLock).toBeCalledTimes(1);
        expect(mockDefaultCtCustomerService.getCustomersByIdRange).toBeCalledTimes(0);
        expect(mockDefaultCustomerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(0);
        expect(mockKlaviyoSdkService.sendEventToKlaviyo).toBeCalledTimes(0);
        expect(errorSpy).toBeCalledTimes(1);
    });
});