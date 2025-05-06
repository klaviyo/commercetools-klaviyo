import express from 'express';
import { GenericAdapter } from './genericAdapter';
import { processEvent } from '../../../../domain/eventSync/processEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import logger from '../../../../utils/log';
import { KlaviyoSdkService } from '../../../driven/klaviyo/KlaviyoSdkService';
import { BatchInterceptor } from '@mswjs/interceptors';
import { ClientRequestInterceptor } from '@mswjs/interceptors/ClientRequest';
import * as packageJson from '../../../../../package.json';

export const app = express();
app.use(express.json());
app.disable('x-powered-by');
const interceptor = new BatchInterceptor({
    name: 'klaviyo-useragent-interceptor',
    interceptors: [new ClientRequestInterceptor()],
});

interceptor.apply();
interceptor.on('request', ({ request }) => {
    /* c8 ignore start */
    if (request.url.includes('a.klaviyo.com')) {
        // Detect running on Connect by certain environment variables
        const runningOnConnect = String(process.env.K_SERVICE || '').includes('event-');
        const hostedOrConnect = runningOnConnect ? 'Connect' : 'Hosted';
        const headerVersion = packageJson.version.replace('v', '');
        request.headers.set('User-Agent', `Commercetools${hostedOrConnect}Sync/${headerVersion}`);
    }
    /* c8 ignore end */
});

app.post('/', async (req, res) => {
    if (!req.body) {
        const msg = 'no Pub/Sub message received';
        console.error(`error: ${msg}`);
        res.status(400).send(`Bad Request: ${msg}`);
        return;
    }

    let payload;
    if (process.env.SKIP_BASE64_DECODE) {
        payload = req.body;
    } else {
        if (!req.body.message) {
            const msg = 'invalid Pub/Sub message format';
            console.error(`error: ${msg}`);
            res.status(400).send(`Bad Request: ${msg}`);
            return;
        }

        const pubSubMessage = req.body.message;

        payload = pubSubMessage.data ? JSON.parse(Buffer.from(pubSubMessage.data, 'base64').toString()) : null;
    }

    logger.info('Starting event processing...');
    try {
        const result = await processEvent(payload as MessageDeliveryPayload, new KlaviyoSdkService());
        switch (result.status) {
            case 'OK':
                res.status(204).send();
                break;
            case '4xx':
                res.status(202).send();
                break;
            default:
                res.status(202).send();
                break;
        }
    } catch (e) {
        logger.error('Unknown PubSub adapter error:', e);
        res.status(500).send();
    }
});

export const pubsubAdapterApp = () => {
    if (process.env.APP_TYPE && process.env.APP_TYPE != 'EVENT' && !process.env.CONNECT_ENV) {
        return;
    }
    return app;
};

export const pubsubAdapter: GenericAdapter = (): Promise<any> => {
    const PORT = process.env.PUB_SUB_PORT || 8080;
    const adapterApp = pubsubAdapterApp();
    if (adapterApp) {
        adapterApp.listen(PORT, () =>
            logger.info(`klaviyo commercetools plugin pub/sub adapter, listening on port ${PORT}`),
        );
        return Promise.resolve(adapterApp);
    }
    return Promise.resolve();
};
