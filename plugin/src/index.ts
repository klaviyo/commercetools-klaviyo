import { GenericAdapter } from './infrastructure/driving/adapter/eventSync/genericAdapter';
import * as dotenv from 'dotenv';
import { bulkSyncApiAdapter } from './infrastructure/driving/adapter/bulkSync/bulkSyncApiAdapter';
import { validateEnvironment } from './utils/validate-configurations';
import { azureServiceBusAdapter } from './infrastructure/driving/adapter/eventSync/azureServiceBusAdapter';

dotenv.config();
validateEnvironment();

const main = (adapter: GenericAdapter) => {
    return adapter();
};
export const eventApp = main(azureServiceBusAdapter);
export const bulkSyncApp = main(bulkSyncApiAdapter);
