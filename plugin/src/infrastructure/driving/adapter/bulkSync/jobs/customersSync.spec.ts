let customerWorkerThreadsMock = {
    parentPort: {
        postMessage: jest.fn(),
        once: jest.fn(),
    },
    workerData: {
        customerIds: [] as string[],
    },
} as any;

const customersSyncMock = {
    syncAllCustomers: jest.fn(),
    syncCustomersByIdRange: jest.fn(),
    releaseLockExternally: jest.fn(),
};

jest.mock('../../../../../domain/bulkSync/CustomersSync', () => ({
    CustomersSync: function () {
        return customersSyncMock;
    },
}));
jest.mock('node:worker_threads', () => customerWorkerThreadsMock);
const customerProcessExitSpy = jest.spyOn(process, 'exit').mockImplementation();

describe('syncCustomers', () => {
    beforeEach(() => {
        customerWorkerThreadsMock = {
            parentPort: {
                postMessage: jest.fn(),
                once: jest.fn(),
            },
            workerData: {
                customerIds: [] as string[],
            },
        } as any;
        jest.resetModules();
    });

    it('should call the right methods when customerIds are present (sync by id)', async () => {
        customerWorkerThreadsMock.workerData.customerIds = ['123456'];
        const syncByIdRangeSpy = jest.spyOn(customersSyncMock, 'syncCustomersByIdRange');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const customersSyncJob = require('./customersSync');
        let error;
        try {
            await customersSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(syncByIdRangeSpy).toHaveBeenCalled();
    });

    it('should call the right methods when customerIds are not present (sync all)', async () => {
        customerWorkerThreadsMock.workerData.customerIds = [];
        const syncAllCustomersSpy = jest.spyOn(customersSyncMock, 'syncAllCustomers');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const customersSyncJob = require('./customersSync');
        let error;
        try {
            await customersSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(syncAllCustomersSpy).toHaveBeenCalled();
    });

    it('should call process.exit when not running as a thread', async () => {
        customerWorkerThreadsMock.parentPort = null;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const customersSyncJob = require('./customersSync');
        const syncAllCustomersSpy = jest.spyOn(customersSyncMock, 'syncAllCustomers');
        let error;
        try {
            await customersSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(customerProcessExitSpy).toHaveBeenCalled();
        expect(syncAllCustomersSpy).toHaveBeenCalled();
    });

    it('should call the cancel method when a "cancel" message is received (as a thread)', async () => {
        customerWorkerThreadsMock.parentPort.once.mockImplementationOnce((message: string, fn: any) => fn('cancel'));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const customersSyncJob = require('./customersSync');
        const syncAllCustomersSpy = jest.spyOn(customersSyncMock, 'syncAllCustomers');
        let error;
        try {
            await customersSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(syncAllCustomersSpy).toHaveBeenCalled();
    });
});
