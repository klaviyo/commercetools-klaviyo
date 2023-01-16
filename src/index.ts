// import { ConfigWrapper, Profiles } from 'klaviyo-api';
// ConfigWrapper('pk_4833622c3ebd39a0d8487e2188248eed11');

import { cloudRunAdapter } from './adapter/cloudRunAdapter';
import { GenericAdapter } from './adapter/genericAdapter';
import * as dotenv from 'dotenv';

dotenv.config();

const main = async (adapter: GenericAdapter) => {
    return adapter();
};
export const app = main(cloudRunAdapter);
