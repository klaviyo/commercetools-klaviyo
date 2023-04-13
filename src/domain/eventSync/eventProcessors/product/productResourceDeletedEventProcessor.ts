import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { ResourceDeletedDeliveryPayload } from '@commercetools/platform-sdk';

export class ProductResourceDeletedEventProcessor extends AbstractEventProcessor {
    isEventValid(): boolean {
        return this.ctMessage.notificationType === 'ResourceDeleted' && this.ctMessage.resource.typeId === 'product';
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as ResourceDeletedDeliveryPayload;
        logger.info(`processing CT ${message.resource.typeId}${message.notificationType} message`);
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
