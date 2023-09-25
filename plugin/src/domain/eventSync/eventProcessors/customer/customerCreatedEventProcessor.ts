import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { Customer, CustomerCreatedMessage } from '@commercetools/platform-sdk';

export class CustomerCreatedEventProcessor extends AbstractEventProcessor {
    isEventValid(): boolean {
        const customerCreatedMessage = this.ctMessage as unknown as CustomerCreatedMessage;
        console.log(
            `CustomerCreatedEventProcessor - Name of the current processor - ${CustomerCreatedEventProcessor.name}`,
        );
        console.log(
            `CustomerCreatedEventProcessor - Name of the current processor using constructor - ${CustomerCreatedEventProcessor.constructor.name}`,
        );
        console.log(
            `CustomerCreatedEventProcessor - Is event valid - ${
                customerCreatedMessage.resource.typeId === 'customer' &&
                customerCreatedMessage.type === 'CustomerCreated' &&
                !!customerCreatedMessage.customer &&
                !!customerCreatedMessage.customer.email &&
                !this.isEventDisabled(CustomerCreatedEventProcessor.name)
            }`,
        );
        console.log(
            `CustomerCreatedEventProcessor - Is event disabled - ${this.isEventDisabled(
                CustomerCreatedEventProcessor.name,
            )}`,
        );
        return (
            customerCreatedMessage.resource.typeId === 'customer' &&
            customerCreatedMessage.type === 'CustomerCreated' &&
            !!customerCreatedMessage.customer &&
            !!customerCreatedMessage.customer.email &&
            !this.isEventDisabled(CustomerCreatedEventProcessor.name)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as CustomerCreatedMessage;
        logger.info(`processing CT ${message.resource.typeId}${message.type} message`);

        let customer: Customer;
        if ('customer' in message) {
            customer = message.customer;
        } else {
            customer = (await this.context.ctCustomerService.getCustomerProfile(
                (message as CustomerCreatedMessage).resource.id,
            )) as Customer;
        }

        const klaviyoEvent: KlaviyoEvent = {
            body: this.context.customerMapper.mapCtCustomerToKlaviyoProfile(customer),
            type: 'profileCreated',
        };
        return [klaviyoEvent];
    }
}
