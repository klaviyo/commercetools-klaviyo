import express from 'express';
import logger from '../../../../utils/log';
import { GenericAdapter } from '../eventSync/genericAdapter';
import { app } from '../eventSync/pubsubAdapter';
import Bree from 'bree';
import breeTs = require('@breejs/ts-worker');
import path = require('path');

if (process.env.JEST_WORKER_ID === undefined) {
    Bree.extend(breeTs);
}

const bree = new Bree({
    root: path.join(__dirname, 'jobs'),
    defaultExtension: process.env.TS_NODE || process.env.JEST_WORKER_ID ? 'ts' : 'js',
    jobs: ['customersSync', 'ordersSync'],
});

export const bulkSyncApp = express();
bulkSyncApp.use(express.json());

bulkSyncApp.post('/sync/orders', (req, res) => {
    logger.info('Received request to sync all orders');
    try {
        bree.run('ordersSync');
        res.status(202).send();
    } catch (e) {
        res.status(500).send();
    }
});

bulkSyncApp.post('/sync/orders/stop', (req, res) => {
    logger.info('Received request to stop syncing all orders');
    try {
        bree.stop('ordersSync');
        res.status(202).send();
    } catch (e) {
        res.status(500).send();
    }
});

bulkSyncApp.post('/sync/customers', (req, res) => {
    logger.info('Received request to sync all customers');
    try {
        bree.run('customersSync');
        res.status(202).send();
    } catch (e) {
        res.status(500).send();
    }
});

bulkSyncApp.post('/sync/customers/stop', (req, res) => {
    logger.info('Received request to stop syncing all customers');
    try {
        bree.stop('customersSync');
        res.status(202).send();
    } catch (e) {
        res.status(500).send();
    }
});

export const bulkSyncApiAdapter: GenericAdapter = (): Promise<any> => {
    const PORT = 6779;
    bulkSyncApp.listen(PORT, () => logger.info(`klaviyo commercetools plugin batch sync, listening on port ${PORT}`));
    return Promise.resolve(app);
};
