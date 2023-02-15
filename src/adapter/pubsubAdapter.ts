import express from 'express';
import { GenericAdapter } from './genericAdapter';
import { processEvent } from '../domain/processEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import logger from '../utils/log';

export const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
    if (!req.body) {
        const msg = 'no Pub/Sub message received';
        console.error(`error: ${msg}`);
        res.status(400).send(`Bad Request: ${msg}`);
        return;
    }
    if (!req.body.message) {
        const msg = 'invalid Pub/Sub message format';
        console.error(`error: ${msg}`);
        res.status(400).send(`Bad Request: ${msg}`);
        return;
    }

    const pubSubMessage = req.body.message;

    const payload = pubSubMessage.data ? JSON.parse(Buffer.from(pubSubMessage.data, 'base64').toString()) : null;
    logger.info('Starting event processing...');
    try {
        const result = await processEvent(payload as MessageDeliveryPayload);
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
        res.status(500).send();
    }
});

export const pubsubAdapter: GenericAdapter = (): Promise<any> => {
    const PORT = 6789;
    app.listen(PORT, () => logger.info(`klaviyo commercetools plugin listening on port ${PORT}`));
    return Promise.resolve(app);
};
