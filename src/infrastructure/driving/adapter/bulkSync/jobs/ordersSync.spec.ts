let orderWorkerThreadsMock = {
    parentPort: {
        postMessage: jest.fn(),
        once: jest.fn(),
    },
    workerData: {
        orderIds: [] as string[],
    },
} as any;

const ordersSyncMock = {
    syncAllOrders: jest.fn(),
    syncOrdersByIdRange: jest.fn(),
    releaseLockExternally: jest.fn(),
};

jest.mock('../../../../../domain/bulkSync/OrdersSync', () => ({
    OrdersSync: function () {
        return ordersSyncMock;
    },
}));
jest.mock('node:worker_threads', () => orderWorkerThreadsMock);
const orderProcessExitSpy = jest.spyOn(process, 'exit').mockImplementation();

describe('syncOrders', () => {
    beforeEach(() => {
        orderWorkerThreadsMock = {
            parentPort: {
                postMessage: jest.fn(),
                once: jest.fn(),
            },
            workerData: {
                orderIds: [] as string[],
            },
        } as any;
        jest.resetModules();
    });

    it('should call the right methods when orderIds are present (sync by id)', async () => {
        orderWorkerThreadsMock.workerData.orderIds = ['123456'];
        const syncByIdRangeSpy = jest.spyOn(ordersSyncMock, 'syncOrdersByIdRange');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ordersSyncJob = require('./ordersSync');
        let error;
        try {
            await ordersSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(syncByIdRangeSpy).toHaveBeenCalled();
    });

    it('should call the right methods when orderIds are not present (sync all)', async () => {
        orderWorkerThreadsMock.workerData.orderIds = [];
        const syncAllOrdersSpy = jest.spyOn(ordersSyncMock, 'syncAllOrders');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ordersSyncJob = require('./ordersSync');
        let error;
        try {
            await ordersSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(syncAllOrdersSpy).toHaveBeenCalled();
    });

    it('should call process.exit when not running as a thread', async () => {
        orderWorkerThreadsMock.parentPort = null;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ordersSyncJob = require('./ordersSync');
        const syncAllOrdersSpy = jest.spyOn(ordersSyncMock, 'syncAllOrders');
        let error;
        try {
            await ordersSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(orderProcessExitSpy).toHaveBeenCalled();
        expect(syncAllOrdersSpy).toHaveBeenCalled();
    });

    it('should call the cancel method when a "cancel" message is received (as a thread)', async () => {
        orderWorkerThreadsMock.parentPort.once.mockImplementationOnce((message: string, fn: any) => fn('cancel'));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ordersSyncJob = require('./ordersSync');
        const syncAllOrdersSpy = jest.spyOn(ordersSyncMock, 'syncAllOrders');
        let error;
        try {
            await ordersSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(syncAllOrdersSpy).toHaveBeenCalled();
    });
});
