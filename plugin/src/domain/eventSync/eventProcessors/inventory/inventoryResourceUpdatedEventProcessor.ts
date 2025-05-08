import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { InventoryEntry, ResourceUpdatedDeliveryPayload } from '@commercetools/platform-sdk';
import { ItemVariantRequest } from '../../../../types/klaviyo-types';
import { KlaviyoEvent } from '../../../../types/klaviyo-plugin';

export class InventoryResourceUpdatedEventProcessor extends AbstractEventProcessor {
    private readonly PROCESSOR_NAME = 'InventoryResourceUpdated';

    isEventValid(): boolean {
        return (
            this.ctMessage.notificationType === 'ResourceUpdated' &&
            this.ctMessage.resource.typeId === 'inventory-entry' &&
            !!this.ctMessage.resourceUserProvidedIdentifiers?.sku &&
            !this.isEventDisabled(this.PROCESSOR_NAME)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as ResourceUpdatedDeliveryPayload;
        logger.info(`processing CT ${message.resource.typeId}${message.notificationType} message`);
        const inventory = (await this.context.ctProductService.getInventoryEntryById(
            message.resource.id,
        )) as InventoryEntry;
        const klaviyoVariant = (
            await this.context.klaviyoService.getKlaviyoItemVariantsByCtSkus(undefined, [
                message.resourceUserProvidedIdentifiers?.sku as string,
            ])
        )[0];
        let klaviyoEvent: KlaviyoEvent;
        if (klaviyoVariant) {
            klaviyoEvent = {
                body: this.context.productMapper.mapCtInventoryEntryToKlaviyoVariant(inventory, klaviyoVariant),
                type: 'variantUpdated',
            };
            if ((klaviyoEvent.body as ItemVariantRequest).data.attributes.inventoryQuantity === undefined) {
                logger.info(
                    `The supply channel from inventory ${message.resource.id} is not configured to be used by variant ${
                        message.resourceUserProvidedIdentifiers?.sku as string
                    }. Skipping.`,
                );
                return [];
            }
            return [klaviyoEvent];
        } else {
            logger.info(
                `Attempted to update inventory for variant ${
                    message.resourceUserProvidedIdentifiers?.sku as string
                }, which is not in Klaviyo yet. Skipping.`,
            );
            return [];
        }
    }
}
