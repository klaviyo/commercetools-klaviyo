import { processEvent } from './processEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { Order } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/order';

describe('main', () => {
    it('should return 0', async () => {
        const message: MessageDeliveryPayload = {
            createdAt: '',
            id: '',
            lastModifiedAt: '',
            notificationType: 'Message',
            projectKey: '',
            resource: {
                typeId: 'order',

                id: 'someId',
                // obj?: Order;
            },
            resourceVersion: 0,
            sequenceNumber: 0,
            version: 0,
        };
        await processEvent(message);
    });
});
