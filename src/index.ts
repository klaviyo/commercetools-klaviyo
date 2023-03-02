import { pubsubAdapter } from './infrastructure/driving/adapter/eventSync/pubsubAdapter';
import { GenericAdapter } from './infrastructure/driving/adapter/eventSync/genericAdapter';
import * as dotenv from 'dotenv';
import { bulkSyncApiAdapter, bulkSyncApp } from "./infrastructure/driving/adapter/batchSync/bulkSyncApiAdapter";

dotenv.config();

const main = (adapter: GenericAdapter) => {
    return adapter();
};
export const eventApp = main(pubsubAdapter);
export const batchApp = main(bulkSyncApiAdapter);
