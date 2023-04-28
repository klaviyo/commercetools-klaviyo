let categoryWorkerThreadsMock = {
    parentPort: {
        postMessage: jest.fn(),
        once: jest.fn(),
    },
    workerData: {
        categoryIds: [] as string[],
        deleteAll: false,
        confirmDeletion: '',
    },
} as any;

const categoriesSyncMock = {
    syncAllCategories: jest.fn(),
    syncCategoriesByIdRange: jest.fn(),
    releaseLockExternally: jest.fn(),
    deleteAllCategories: jest.fn(),
};

jest.mock('../../../../../domain/bulkSync/CategoriesSync', () => ({
    CategoriesSync: function () {
        return categoriesSyncMock;
    },
}));
jest.mock('node:worker_threads', () => categoryWorkerThreadsMock);
const categoryProcessExitSpy = jest.spyOn(process, 'exit').mockImplementation();

describe('syncCategories', () => {
    beforeEach(() => {
        categoryWorkerThreadsMock = {
            parentPort: {
                postMessage: jest.fn(),
                once: jest.fn(),
            },
            workerData: {
                categoryIds: [] as string[],
            },
        } as any;
        jest.resetModules();
    });

    it('should call the right methods when categoryIds are not present (sync all)', async () => {
        const syncAllCategoriesSpy = jest.spyOn(categoriesSyncMock, 'syncAllCategories');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const categoriesSyncJob = require('./categoriesSync');
        let error;
        try {
            await categoriesSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(syncAllCategoriesSpy).toHaveBeenCalled();
    });

    it('should call the right methods when deleting (delete all from klaviyo)', async () => {
        categoryWorkerThreadsMock.workerData.deleteAll = true;
        categoryWorkerThreadsMock.workerData.confirmDeletion = 'categories';
        const deleteAllCategoriesSpy = jest.spyOn(categoriesSyncMock, 'deleteAllCategories');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const deleteCategoriesJob = require('./categoriesSync');
        let error;
        try {
            await deleteCategoriesJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(deleteAllCategoriesSpy).toHaveBeenCalled();
    });

    it('should call process.exit when not running as a thread', async () => {
        categoryWorkerThreadsMock.parentPort = null;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const categoriesSyncJob = require('./categoriesSync');
        const syncAllCategoriesSpy = jest.spyOn(categoriesSyncMock, 'syncAllCategories');
        let error;
        try {
            await categoriesSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(categoryProcessExitSpy).toHaveBeenCalled();
        expect(syncAllCategoriesSpy).toHaveBeenCalled();
    });

    it('should call the cancel method when a "cancel" message is received (as a thread)', async () => {
        categoryWorkerThreadsMock.parentPort.once.mockImplementationOnce((message: string, fn: any) => fn('cancel'));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const categoriesSyncJob = require('./categoriesSync');
        const syncAllCategoriesSpy = jest.spyOn(categoriesSyncMock, 'syncAllCategories');
        let error;
        try {
            await categoriesSyncJob;
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(syncAllCategoriesSpy).toHaveBeenCalled();
    });
});
