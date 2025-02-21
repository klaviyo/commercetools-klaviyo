import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { Product, ProductPublishedMessage } from '@commercetools/platform-sdk';
import config from 'config';
import { KlaviyoEvent } from '../../../../types/klaviyo-plugin';

export class ProductPublishedEventProcessor extends AbstractEventProcessor {
    private readonly PROCESSOR_NAME = 'ProductPublished';

    isEventValid(): boolean {
        const message = this.ctMessage as unknown as ProductPublishedMessage;
        return (
            message.resource.typeId === 'product' &&
            this.isValidMessageType(message.type) &&
            !this.isEventDisabled(this.PROCESSOR_NAME)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as ProductPublishedMessage;
        logger.info(`processing product published message`);
        const ctProduct = (await this.context.ctProductService.getProductById(message.resource.id)) as Product;
        const klaviyoItem = await this.context.klaviyoService.getKlaviyoItemByExternalId(message.resource.id);

        const variantRequests = await this.generateProductVariantsRequestsForKlaviyo(ctProduct);

        let klaviyoEvent: KlaviyoEvent;
        if (!klaviyoItem || !klaviyoItem.id) {
            klaviyoEvent = {
                body: this.context.productMapper.mapCtProductToKlaviyoItem(ctProduct, false),
                type: 'itemCreated',
            };
        } else {
            klaviyoEvent = {
                body: this.context.productMapper.mapCtProductToKlaviyoItem(ctProduct, true),
                type: 'itemUpdated',
            };
        }

        return [klaviyoEvent, ...variantRequests];
    }

    private isValidMessageType(type: string): boolean {
        return Boolean(
            config.has('product.messages.published') &&
                (config.get('product.messages.published') as string[])?.includes(type),
        );
    }

    private generateProductVariantsRequestsForKlaviyo = async (product: Product): Promise<KlaviyoEvent[]> => {
        const combinedVariants = [product.masterData.current.masterVariant].concat(product.masterData.current.variants);
        const ctProductVariants = combinedVariants
            .map((v) => v.sku || '')
            .filter((v) => v)
            .map((v) => `$custom:::$default:::${v}`);
        const klaviyoVariants = (
            await this.context.klaviyoService.getKlaviyoItemVariantsByCtSkus(product.id, undefined, ['id'])
        ).map((i) => i.id);
        const variantsForCreation = combinedVariants.filter(
            (v) => !klaviyoVariants.includes(`$custom:::$default:::${v.sku}`),
        );
        const variantsForUpdate = combinedVariants.filter((v) =>
            klaviyoVariants.includes(`$custom:::$default:::${v.sku}`),
        );
        const variantsForDeletion = klaviyoVariants.filter((v) => v && !ctProductVariants.includes(v));
        const promises: KlaviyoEvent[] = [];
        if (variantsForDeletion.length) {
            variantsForDeletion.forEach((variantId) => {
                promises.push({
                    type: 'variantDeleted',
                    body: this.context.productMapper.mapKlaviyoVariantIdToDeleteVariantRequest(variantId),
                });
            });
        }
        if (variantsForCreation.length) {
            variantsForCreation.forEach((variant) => {
                promises.push({
                    type: 'variantCreated',
                    body: this.context.productMapper.mapCtProductVariantToKlaviyoVariant(product, variant, false),
                });
            });
        }
        if (variantsForUpdate.length) {
            variantsForUpdate.forEach((variant) => {
                promises.push({
                    type: 'variantUpdated',
                    body: this.context.productMapper.mapCtProductVariantToKlaviyoVariant(product, variant, true),
                });
            });
        }
        return promises;
    };
}
