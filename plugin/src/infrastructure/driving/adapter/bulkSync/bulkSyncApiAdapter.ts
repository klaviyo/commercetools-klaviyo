import express from 'express';
import logger from '../../../../utils/log';
import { GenericAdapter } from '../eventSync/genericAdapter';
import { app } from '../eventSync/pubsubAdapter';
import Bree from 'bree';
import { CTCustomObjectLockService } from '../../../../domain/bulkSync/services/CTCustomObjectLockService';
import { getApiRoot } from '../../../driven/commercetools/ctService';
import { ErrorCodes } from '../../../../types/errors/StatusError';
import breeTs = require('@breejs/ts-worker');
import path = require('path');

if (process.env.JEST_WORKER_ID === undefined) {
    Bree.extend(breeTs);
}

const bree = new Bree({
    root: path.join(__dirname, 'jobs'),
    defaultExtension: process.env.TS_NODE || process.env.JEST_WORKER_ID ? 'ts' : 'js',
    jobs: [
        {
            name: 'status',
            path: () => {
                logger.info('Status check called, not currently implemented.');
            },
        },
    ],
    workerMessageHandler: async (workerMessage) => {
        if (workerMessage.message === 'done') {
            await bree.remove(workerMessage.name);
        }
    },
});

const ctLockService = new CTCustomObjectLockService(getApiRoot());

export const bulkSyncApp = express();
bulkSyncApp.use(express.json());

bulkSyncApp.post('/sync/orders', async (req, res) => {
    logger.info('Received request to sync orders');
    try {
        await ctLockService.checkLock('orderFullSync');
        let orderIds: string[] = [];
        let startId = '';
        if (req.body?.ids?.length) {
            orderIds = req.body?.ids;
        } else if (req.body?.startId?.length) {
            startId = req.body?.startId;
        }
        await bree.add([
            {
                name: 'ordersSync',
                worker: {
                    workerData: {
                        orderIds,
                        startId,
                    },
                },
            },
        ]);
        await bree.run('ordersSync');
        res.status(202).send();
    } catch (e: any) {
        if (e?.message?.includes('is already running') || e?.message?.includes('duplicate job name')) {
            logger.warn("Tried to start orders sync, but it's already running.");
            res.status(423).send({
                message: 'Orders sync is already running.',
            });
        }
        if (e?.code === ErrorCodes.LOCKED) {
            logger.warn("Tried to start orders sync, but it's locked.");
            res.status(423).send({
                message: 'Orders sync is already running or a lock already exists.',
            });
        }
        res.status(500).send();
    }
});

bulkSyncApp.post('/sync/orders/stop', async (req, res) => {
    logger.info('Received request to stop syncing orders');
    try {
        await bree.remove('ordersSync');
        res.status(200).send();
    } catch (e: any) {
        if (e?.message?.includes('does not exist')) {
            logger.warn("Tried to stop orders sync, but it isn't currently in progress.");
            res.status(400).send({
                message: 'Orders sync is not currently running.',
            });
        }
        res.status(500).send();
    }
});

bulkSyncApp.post('/sync/customers', async (req, res) => {
    logger.info('Received request to sync customers');
    try {
        await ctLockService.checkLock('customerFullSync');
        let customerIds: string[] = [];
        if (req.body?.ids?.length) {
            customerIds = req.body?.ids;
        }
        await bree.add([
            {
                name: 'customersSync',
                worker: {
                    workerData: {
                        customerIds,
                    },
                },
            },
        ]);
        await bree.run('customersSync');
        res.status(202).send();
    } catch (e: any) {
        if (e?.message?.includes('is already running') || e?.message?.includes('duplicate job name')) {
            logger.warn("Tried to start customers sync, but it's already running.");
            res.status(423).send({
                message: 'Customers sync is already running.',
            });
        }
        if (e?.code === ErrorCodes.LOCKED) {
            logger.warn("Tried to start customers sync, but it's locked.");
            res.status(423).send({
                message: 'Customers sync is already running or a lock already exists.',
            });
        }
        res.status(500).send();
    }
});

bulkSyncApp.post('/sync/customers/stop', async (req, res) => {
    logger.info('Received request to stop syncing customers');
    try {
        await bree.remove('customersSync');
        res.status(200).send();
    } catch (e: any) {
        if (e?.message?.includes('does not exist')) {
            logger.warn("Tried to stop customers sync, but it isn't currently in progress.");
            res.status(400).send({
                message: 'Customers sync is not currently running.',
            });
        }
        res.status(500).send();
    }
});

bulkSyncApp.post('/sync/categories', async (req, res) => {
    logger.info('Received request to sync categories');
    try {
        let confirmDeletion = '';
        if (req.body?.deleteAll) {
            if (req.body?.confirmDeletion !== 'categories') {
                res.status(400).send({
                    message:
                        'For testing only. This operation will delete ALL CATEGORIES in Klaviyo, including those not created by this plugin. If you understand the risk and still want to do it, add "confirmDeletion": "categories" to the request body.',
                });
                return;
            } else {
                confirmDeletion = 'categories';
            }
        }
        await ctLockService.checkLock('categoryFullSync');
        await bree.add([
            {
                name: 'categoriesSync',
                worker: {
                    workerData: {
                        confirmDeletion,
                    },
                },
            },
        ]);
        await bree.run('categoriesSync');
        res.status(202).send();
    } catch (e: any) {
        if (e?.message?.includes('is already running') || e?.message?.includes('duplicate job name')) {
            logger.warn("Tried to start categories sync, but it's already running.");
            res.status(423).send({
                message: 'Categories sync is already running.',
            });
        }
        if (e?.code === ErrorCodes.LOCKED) {
            logger.warn("Tried to start categories sync, but it's locked.");
            res.status(423).send({
                message: 'Categories sync is already running or a lock already exists.',
            });
        }
        res.status(500).send();
    }
});

bulkSyncApp.post('/sync/categories/stop', async (req, res) => {
    logger.info('Received request to stop syncing categories');
    try {
        await bree.remove('categoriesSync');
        res.status(200).send();
    } catch (e: any) {
        if (e?.message?.includes('does not exist')) {
            logger.warn("Tried to stop categories sync, but it isn't currently in progress.");
            res.status(400).send({
                message: 'Categories sync is not currently running.',
            });
        }
        res.status(500).send();
    }
});

bulkSyncApp.post('/sync/products', async (req, res) => {
    logger.info('Received request to sync products');
    try {
        let confirmDeletion = '';
        if (req.body?.deleteAll) {
            if (req.body?.confirmDeletion !== 'products') {
                res.status(400).send({
                    message:
                        'For testing only. This operation will delete ALL PRODUCTS/VARIANTS in Klaviyo, including those not created by this plugin. If you understand the risk and still want to do it, add "confirmDeletion": "products" to the request body.',
                });
                return;
            } else {
                confirmDeletion = 'products';
            }
        }
        await ctLockService.checkLock('productFullSync');
        await bree.add([
            {
                name: 'productsSync',
                worker: {
                    workerData: {
                        confirmDeletion,
                    },
                },
            },
        ]);
        await bree.run('productsSync');
        res.status(202).send();
    } catch (e: any) {
        if (e?.message?.includes('is already running') || e?.message?.includes('duplicate job name')) {
            logger.warn("Tried to start products sync, but it's already running.");
            res.status(423).send({
                message: 'Products sync is already running.',
            });
        }
        if (e?.code === ErrorCodes.LOCKED) {
            logger.warn("Tried to start products sync, but it's locked.");
            res.status(423).send({
                message: 'Products sync is already running or a lock already exists.',
            });
        }
        res.status(500).send();
    }
});

bulkSyncApp.post('/sync/products/stop', async (req, res) => {
    logger.info('Received request to stop syncing products');
    try {
        await bree.remove('productsSync');
        res.status(200).send();
    } catch (e: any) {
        if (e?.message?.includes('does not exist')) {
            logger.warn("Tried to stop products sync, but it isn't currently in progress.");
            res.status(400).send({
                message: 'Products sync is not currently running.',
            });
        }
        res.status(500).send();
    }
});

bulkSyncApp.get('/sync/status', async (req, res) => {
    logger.info('Received request to log global job status');
    await bree.run('status');
    res.status(202).send();
});

export const bulkSyncApiAdapter: GenericAdapter = (): Promise<any> => {
    if ((process.env.APP_TYPE && process.env.APP_TYPE != 'BULK_IMPORT') || process.env.CONNECT_ENV) {
        return Promise.resolve();
    }
    const PORT = process.env.BULK_IMPORT_PORT || 6779;
    bulkSyncApp.listen(PORT, () => logger.info(`klaviyo commercetools plugin bulk sync, listening on port ${PORT}`));
    return Promise.resolve(app);
};
