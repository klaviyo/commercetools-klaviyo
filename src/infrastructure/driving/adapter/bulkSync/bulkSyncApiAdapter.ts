import express from 'express';
import logger from '../../../../utils/log';
import { KlaviyoSdkService } from '../../../driven/klaviyo/KlaviyoSdkService';
import { DefaultOrderMapper } from '../../../../domain/shared/mappers/DefaultOrderMapper';
import { DummyCurrencyService } from '../../../../domain/shared/services/dummyCurrencyService';
import { OrdersSync } from '../../../../domain/bulkSync/OrdersSync';
import { CTCustomObjectLockService } from '../../../../domain/bulkSync/services/CTCustomObjectLockService';
import { getApiRoot } from '../../../driven/commercetools/ctService';
import { DefaultCtOrderService } from '../../../driven/commercetools/DefaultCtOrderService';
import { GenericAdapter } from '../eventSync/genericAdapter';
import { app } from '../eventSync/pubsubAdapter';
import { CustomersSync } from '../../../../domain/bulkSync/CustomersSync';
import { DefaultCtCustomerService } from '../../../driven/commercetools/DefaultCtCustomerService';
import { DefaultCustomerMapper } from '../../../../domain/shared/mappers/DefaultCustomerMapper';

export const bulkSyncApp = express();
bulkSyncApp.use(express.json());

bulkSyncApp.post('/sync/orders', async (req, res) => {
    logger.info('Received request to sync all orders');
    try {
        const ordersSync = new OrdersSync(
            new CTCustomObjectLockService(getApiRoot()),
            new DefaultOrderMapper(new DummyCurrencyService()),
            new KlaviyoSdkService(),
            new DefaultCtOrderService(getApiRoot()),
        );
        res.status(202).send();

        await ordersSync.syncAllOrders();
    } catch (e) {
        res.status(500).send();
    }
});

bulkSyncApp.post('/sync/customers', async (req, res) => {
    logger.info('Received request to sync all customers');
    try {
        const customersSync = new CustomersSync(
            new CTCustomObjectLockService(getApiRoot()),
            new DefaultCustomerMapper(),
            new KlaviyoSdkService(),
            new DefaultCtCustomerService(getApiRoot()),
        );
        res.status(202).send();

        await customersSync.syncAllCustomers();
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
