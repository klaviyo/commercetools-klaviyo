import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { ResourceDeletedDeliveryPayload } from '@commercetools/platform-sdk';
import config from 'config';

export class ProductResourceDeletedEventProcessor extends AbstractEventProcessor {
    private readonly PROCESSOR_NAME = 'ProductResourceDeleted';

    isEventValid(): boolean {
        return (
            this.ctMessage.resource.typeId === 'product' &&
            this.isValidMessageType(this.ctMessage.notificationType) &&
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
            type: 'itemDeleted',
        };
        return [klaviyoEvent];
    }

    private isValidMessageType(type: string): boolean {
        return Boolean(
            config.has('product.messages.deleted') &&
                (config.get('product.messages.deleted') as string[])?.includes(type),
        );
    }
}
