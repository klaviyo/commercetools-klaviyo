import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { ResourceDeletedDeliveryPayload } from '@commercetools/platform-sdk';
import { KlaviyoEvent } from '../../../../types/klaviyo-plugin';

export class CategoryResourceDeletedEventProcessor extends AbstractEventProcessor {
    private readonly PROCESSOR_NAME = 'CategoryResourceDeleted';

    isEventValid(): boolean {
        return (
            this.ctMessage.notificationType === 'ResourceDeleted' &&
            this.ctMessage.resource.typeId === 'category' &&
            !this.isEventDisabled(this.PROCESSOR_NAME)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as ResourceDeletedDeliveryPayload;
        logger.info(`processing CT ${message.resource.typeId}${message.notificationType} message`);
        const klaviyoEvent: KlaviyoEvent = {
            body: {
                data: {
                    id: `$custom:::$default:::${message.resource.id}`,
                },
            },
            type: 'categoryDeleted',
        };
        return [klaviyoEvent];
    }
}
