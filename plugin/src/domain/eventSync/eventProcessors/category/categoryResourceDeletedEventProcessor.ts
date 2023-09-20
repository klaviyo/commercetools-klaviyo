import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { ResourceDeletedDeliveryPayload } from '@commercetools/platform-sdk';

export class CategoryResourceDeletedEventProcessor extends AbstractEventProcessor {
    isEventValid(): boolean {
        return (
            this.ctMessage.notificationType === 'ResourceDeleted' &&
            this.ctMessage.resource.typeId === 'category' &&
            !this.isEventDisabled(CategoryResourceDeletedEventProcessor.name)
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
