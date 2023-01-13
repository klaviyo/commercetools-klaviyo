import { AbstractEvent } from './abstractEvent.js';
import logger from '../../utils/log';

export class OrderCreatedEvent extends AbstractEvent {
    // constructor(private readonly ctMessage: MessageDeliveryPayload) {
    //     super(ctMessage);
    // }
    isEventValid(): boolean {
        return this.ctMessage.resource.typeId === 'order';
    }

    generateKlaviyoEvent(): KlaviyoEvent {
        logger.info('Processing order created event');

        const body = {
            token: 'PUBLIC_API_KEY',
            event: 'Created Invoice',
            customer_properties: {
                $email: 'john.smith@test.com',
                $first_name: 'John',
                $last_name: 'Smith',
                $phone_number: '5551234567',
                $address1: '123 Abc st',
                $address2: 'Suite 1',
                $city: 'Boston',
                $zip: '02110',
                $region: 'MA',
                $country: 'USA',
            },
            properties: {
                $event_id: '1234',
                ...this.ctMessage.resource,
            },
            time: 1387302423,
        };
        return {
            body: body,
        };

        logger.info('Processing order created event, winston logs');
    }
}
