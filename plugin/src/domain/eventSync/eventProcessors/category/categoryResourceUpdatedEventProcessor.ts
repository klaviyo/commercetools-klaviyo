import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { Category, ResourceUpdatedDeliveryPayload } from '@commercetools/platform-sdk';

export class CategoryResourceUpdatedEventProcessor extends AbstractEventProcessor {
    isEventValid(): boolean {
        return (
            this.ctMessage.notificationType === 'ResourceUpdated' &&
            this.ctMessage.resource.typeId === 'category' &&
            !this.isEventDisabled(CategoryResourceUpdatedEventProcessor.name)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as ResourceUpdatedDeliveryPayload;
        logger.info(`processing CT ${message.resource.typeId}${message.notificationType} message`);
        const category = (await this.context.ctCategoryService.getCategoryById(message.resource.id)) as Category;
        const klaviyoCategory = await this.context.klaviyoService.getKlaviyoCategoryByExternalId(message.resource.id);
        let klaviyoEvent: KlaviyoEvent;
        if (!klaviyoCategory || !klaviyoCategory.id) {
            klaviyoEvent = {
                body: this.context.categoryMapper.mapCtCategoryToKlaviyoCategory(category),
                type: 'categoryCreated',
            };
        } else {
            klaviyoEvent = {
                body: this.context.categoryMapper.mapCtCategoryToKlaviyoCategory(category, klaviyoCategory?.id),
                type: 'categoryUpdated',
            };
        }
        return [klaviyoEvent];
    }
}
