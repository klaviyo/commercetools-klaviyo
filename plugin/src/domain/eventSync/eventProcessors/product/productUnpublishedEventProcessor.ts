import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { ProductUnpublishedMessage } from '@commercetools/platform-sdk';
import config from 'config';
import { KlaviyoEvent } from '../../../../types/klaviyo-plugin';

export class ProductUnpublishedEventProcessor extends AbstractEventProcessor {
    private readonly PROCESSOR_NAME = 'ProductUnpublished';

    isEventValid(): boolean {
        const message = this.ctMessage as unknown as ProductUnpublishedMessage;
        return (
            message.resource.typeId === 'product' &&
            this.isValidMessageType(message.type) &&
            !this.isEventDisabled(this.PROCESSOR_NAME)
        );
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
