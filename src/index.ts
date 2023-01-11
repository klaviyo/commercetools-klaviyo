// import { ConfigWrapper, Profiles } from 'klaviyo-api';
// ConfigWrapper('pk_4833622c3ebd39a0d8487e2188248eed11');

import { cloudRunAdapter } from './adapter/cloudRunAdapter.js';
import { GenericAdapter } from './adapter/genericAdapter';
import * as dotenv from 'dotenv';
dotenv.config();

// export const main = async () => {
//     console.log('Hello world!');
//     const profileId = 'PROFILE_ID';
//     const opts = {};
//
//     try {
//         console.time('klaviyocall');
//         const response = await Profiles.getProfiles();
//         console.timeEnd('klaviyocall');
//         console.log(JSON.stringify(response));
//     } catch (error) {
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         console.log(`An error was thrown check the HTTP code with ${error.status}`);
//     }
//     return 0;
// };
//
// await main();

const main = async (adapter: GenericAdapter) => {
    return adapter();
};
export const app = await main(cloudRunAdapter);
