import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { CategoryCreatedMessage, Category } from '@commercetools/platform-sdk';
import config from 'config';
import { CategoryRequest } from '../../../../types/klaviyo-types';
import { KlaviyoEvent } from '../../../../types/klaviyo-plugin';

export class CategoryCreatedEventProcessor extends AbstractEventProcessor {
    private readonly PROCESSOR_NAME = 'CategoryCreated';

    isEventValid(): boolean {
        const message = this.ctMessage as unknown as CategoryCreatedMessage;
        return (
            message.resource.typeId === 'category' &&
            this.isValidMessageType(message.type) &&
            !this.isEventDisabled(this.PROCESSOR_NAME)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as CategoryCreatedMessage;
        logger.info('Processing category created event');

        // Always get category from CT to expanded ancestors are available
        const category = (await this.context.ctCategoryService.getCategoryById(
            (message as CategoryCreatedMessage).resource.id,
        )) as Category;

        const body: CategoryRequest = this.context.categoryMapper.mapCtCategoryToKlaviyoCategory(category);

        const events: KlaviyoEvent[] = [{ body, type: 'categoryCreated' }];

        return Promise.resolve(events);
    }

    private isValidMessageType(type: string): boolean {
        return Boolean(
            config.has('category.messages.created') &&
                (config.get('category.messages.created') as string[])?.includes(type),
        );
    }
}
