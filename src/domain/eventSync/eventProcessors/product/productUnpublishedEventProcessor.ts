import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { ProductUnpublishedMessage } from '@commercetools/platform-sdk';
import config from 'config';

export class ProductUnpublishedEventProcessor extends AbstractEventProcessor {
    isEventValid(): boolean {
        const message = this.ctMessage as unknown as ProductUnpublishedMessage;
        return message.resource.typeId === 'product' && this.isValidMessageType(message.type);
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as ProductUnpublishedMessage;
        logger.info(`processing product unpublished message`);
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
