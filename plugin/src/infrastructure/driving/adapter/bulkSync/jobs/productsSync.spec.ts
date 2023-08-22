let productWorkerThreadsMock = {
    parentPort: {
        postMessage: jest.fn(),
        once: jest.fn(),
    },
    workerData: {
        productIds: [] as string[],
        deleteAll: false,
        confirmDeletion: '',
    },
} as any;

const productsSyncMock = {
    syncAllProducts: jest.fn(),
    deleteAllProducts: jest.fn(),
    releaseLockExternally: jest.fn(),
};

jest.mock('../../../../../domain/bulkSync/ProductsSync', () => ({
    ProductsSync: function () {
        return productsSyncMock;
    },
}));
jest.mock('node:worker_threads', () => productWorkerThreadsMock);
const productProcessExitSpy = jest.spyOn(process, 'exit').mockImplementation();

describe('syncProducts', () => {
    beforeEach(() => {
        productWorkerThreadsMock = {
            parentPort: {
                postMessage: jest.fn(),
                once: jest.fn(),
            },
            workerData: {
                productIds: [] as string[],
            },
        } as any;
        jest.resetModules();
    });

    it('should call the right methods when productIds are not present (sync all)', async () => {
        const syncAllProductsSpy = jest.spyOn(productsSyncMock, 'syncAllProducts');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const productsSyncJob = require('./productsSync');
        let error;
        try {
            await productsSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(syncAllProductsSpy).toHaveBeenCalled();
    });

    it('should call the right methods when deleting (delete all from klaviyo)', async () => {
        productWorkerThreadsMock.workerData.deleteAll = true;
        productWorkerThreadsMock.workerData.confirmDeletion = 'products';
        const deleteAllProductsSpy = jest.spyOn(productsSyncMock, 'deleteAllProducts');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const deleteItemsJob = require('./productsSync');
        let error;
        try {
            await deleteItemsJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(deleteAllProductsSpy).toHaveBeenCalled();
    });

    it('should call process.exit when not running as a thread', async () => {
        productWorkerThreadsMock.parentPort = null;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const productsSyncJob = require('./productsSync');
        const syncAllProductsSpy = jest.spyOn(productsSyncMock, 'syncAllProducts');
        let error;
        try {
            await productsSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(productProcessExitSpy).toHaveBeenCalled();
        expect(syncAllProductsSpy).toHaveBeenCalled();
    });

    it('should call the cancel method when a "cancel" message is received (as a thread)', async () => {
        productWorkerThreadsMock.parentPort.once.mockImplementationOnce((message: string, fn: any) => fn('cancel'));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const productsSyncJob = require('./productsSync');
        const syncAllProductsSpy = jest.spyOn(productsSyncMock, 'syncAllProducts');
        let error;
        try {
            await productsSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(syncAllProductsSpy).toHaveBeenCalled();
    });
});
