import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { CustomerCreatedMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';

export class CustomerCreatedEventProcessor extends AbstractEventProcessor {
    isEventValid(): boolean {
        const customerCreatedMessage = this.ctMessage as unknown as CustomerCreatedMessage;
        return (
            customerCreatedMessage.resource.typeId === 'customer' &&
            customerCreatedMessage.type === 'CustomerCreated' &&
            !!customerCreatedMessage.customer &&
            !!customerCreatedMessage.customer.email
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as CustomerCreatedMessage;
        logger.info(`processing CT ${message.resource.typeId}${message.type} message`);
        const klaviyoEvent: KlaviyoEvent = {
            body: this.context.customerMapper.mapCtCustomerToKlaviyoProfile(message.customer),
            type: 'profileCreated',
        };
        return [klaviyoEvent];
    }
}
