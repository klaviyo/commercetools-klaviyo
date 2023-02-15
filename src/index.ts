import { pubsubAdapter } from './adapter/pubsubAdapter';
import { GenericAdapter } from './adapter/genericAdapter';
import * as dotenv from 'dotenv';

dotenv.config();

const main = (adapter: GenericAdapter) => {
    return adapter();
};
export const app = main(pubsubAdapter);
