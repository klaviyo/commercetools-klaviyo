import { AbstractEvent } from '../abstractEvent';
import logger from '../../../utils/log';
import { getCustomerProfile } from '../../ctService';
import { ResourceUpdatedDeliveryPayload } from '@commercetools/platform-sdk';
import { getKlaviyoProfileByExternalId } from '../../klaviyoService';
import { mapCTCustomerToKlaviyoProfile } from './mappers/CTCustomerToKlaviyoProfileMapper';
import { StatusError } from '../../../types/errors/StatusError';

export class CustomerResourceUpdatedEventProcessor extends AbstractEvent {
    isEventValid(): boolean {
        return this.ctMessage.notificationType === 'ResourceUpdated' && this.ctMessage.resource.typeId === 'customer';
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as ResourceUpdatedDeliveryPayload;
        logger.info(`processing CT ${message.resource.typeId}${message.notificationType} message`);
        const customer = await getCustomerProfile(message.resource.id);
        if (!customer) {
            return [];
        }
        const klaviyoProfile = await getKlaviyoProfileByExternalId(message.resource.id);
        if (!klaviyoProfile || !klaviyoProfile.id) {
            throw new StatusError(404, `Profile not found in klaviyo with external id ${message.resource.id}`);
        }

        const body: ProfileRequest = {
            data: {
                type: 'profile',
                id: klaviyoProfile?.id,
                attributes: mapCTCustomerToKlaviyoProfile(customer),
            },
        };
        return [
            {
                body: body,
                type: 'profileResourceUpdated',
            },
        ];
    }
}
