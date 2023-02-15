import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../utils/log';
import { getCustomerProfile } from '../../ctService';
import { ResourceUpdatedDeliveryPayload } from '@commercetools/platform-sdk';
import { getKlaviyoProfileByExternalId } from '../../klaviyoService';
import { mapCTCustomerToKlaviyoProfile } from './mappers/CTCustomerToKlaviyoProfileMapper';

export class CustomerResourceUpdatedEventProcessor extends AbstractEventProcessor {
    isEventValid(): boolean {
        return this.ctMessage.notificationType === 'ResourceUpdated' && this.ctMessage.resource.typeId === 'customer';
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as ResourceUpdatedDeliveryPayload;
        logger.info(`processing CT ${message.resource.typeId}${message.notificationType} message`);
        const customer = await getCustomerProfile(message.resource.id);
        const klaviyoProfile = await getKlaviyoProfileByExternalId(message.resource.id);
        let klaviyoEvent: KlaviyoEvent;
        if (!klaviyoProfile || !klaviyoProfile.id) {
            klaviyoEvent = {
                body: {
                    data: {
                        type: 'profile',
                        attributes: mapCTCustomerToKlaviyoProfile(customer),
                    },
                },
                type: 'profileCreated',
            };
        } else {
            klaviyoEvent = {
                body: {
                    data: {
                        type: 'profile',
                        id: klaviyoProfile?.id,
                        attributes: mapCTCustomerToKlaviyoProfile(customer),
                    },
                },
                type: 'profileResourceUpdated',
            };
        }
        return [klaviyoEvent];
    }
}
