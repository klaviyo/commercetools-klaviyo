import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { ResourceUpdatedDeliveryPayload } from '@commercetools/platform-sdk';

export class CustomerResourceUpdatedEventProcessor extends AbstractEventProcessor {
    isEventValid(): boolean {
        return this.ctMessage.notificationType === 'ResourceUpdated' && this.ctMessage.resource.typeId === 'customer';
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as ResourceUpdatedDeliveryPayload;
        logger.info(`processing CT ${message.resource.typeId}${message.notificationType} message`);
        const customer = await this.context.ctCustomerService.getCustomerProfile(message.resource.id);
        const klaviyoProfile = await this.context.klaviyoService.getKlaviyoProfileByExternalId(message.resource.id);
        let klaviyoEvent: KlaviyoEvent;
        if (!klaviyoProfile || !klaviyoProfile.id) {
            klaviyoEvent = {
                body: this.context.customerMapper.mapCtCustomerToKlaviyoProfile(customer),
                type: 'profileCreated',
            };
        } else {
            klaviyoEvent = {
                body: this.context.customerMapper.mapCtCustomerToKlaviyoProfile(customer, klaviyoProfile?.id),
                type: 'profileResourceUpdated',
            };
        }
        return [klaviyoEvent];
    }
}
