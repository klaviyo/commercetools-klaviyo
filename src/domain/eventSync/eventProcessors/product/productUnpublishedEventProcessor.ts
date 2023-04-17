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
                    deleteVariantsJob: await this.generateDeleteVariantsJobRequestForKlaviyo(message.resource.id),
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

    private generateDeleteVariantsJobRequestForKlaviyo = async (productId: string): Promise<KlaviyoEvent> => {
        const klaviyoVariants = (
            await this.context.klaviyoService.getKlaviyoItemVariantsByCtSkus(productId, undefined, ['id'])
        ).map((i: any) => i.id);
        return {
            type: 'variantDeleted',
            body: this.context.productMapper.mapCtProductVariantsToKlaviyoVariantsJob(
                {} as any,
                klaviyoVariants as string[],
                'variantDeleted',
            ),
        }
    };
}
